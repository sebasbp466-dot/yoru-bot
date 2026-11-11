'use strict';
const { PERSONAS } = require('./personas');
const API = 'https://generativelanguage.googleapis.com/v1beta/models/';
const today = () => new Date().toISOString().slice(0, 10);

class Gemini {
  /** opts.fetch permite inyectar un fetch falso en los tests */
  constructor(cfg, db, log, opts = {}) {
    this.cfg = cfg; this.db = db; this.log = log; this.fetch = opts.fetch || globalThis.fetch;
    this.keyDown = new Map();   // key -> timestamp hasta el que está en pausa
    this.modelDown = new Map(); // modelo -> idem
    this.rr = 0; this.last = { model: '', at: 0, ok: true, err: '' };
  }
  get hasKeys() { return this.cfg.geminiKeys.length > 0; }
  /** Orden de modelos a probar según la preferencia: el elegido primero y el resto como respaldo */
  chain(pref) {
    const m = this.cfg.models, all = { flash: m.flash, lite: m.lite, pro: m.pro };
    const order = pref === 'auto' ? ['flash', 'lite', 'pro'] : [pref, ...['flash', 'lite', 'pro'].filter(x => x !== pref)];
    return order.map(k => ({ alias: k, id: all[k] })).filter(x => x.id);
  }
  status() {
    const now = Date.now();
    return {
      pref: this.db.data.settings.model, keys: this.cfg.geminiKeys.length,
      keysPaused: [...this.keyDown.values()].filter(t => t > now).length,
      models: Object.entries(this.cfg.models).map(([alias, id]) => ({ alias, id, paused: (this.modelDown.get(id) || 0) > now })),
      last: this.last
    };
  }
  nextKey() {
    const ks = this.cfg.geminiKeys, now = Date.now();
    for (let i = 0; i < ks.length; i++) { const k = ks[(this.rr + i) % ks.length]; if ((this.keyDown.get(k) || 0) <= now) { this.rr = (this.rr + i + 1) % ks.length; return k; } }
    return null;
  }
  /** Comprueba y suma el uso diario de un usuario. Devuelve {ok, left}. */
  quota(user, premium, owner) {
    const lim = this.cfg.dailyLimit * (premium ? 4 : 1);
    if (user.aiDay !== today()) { user.aiDay = today(); user.aiN = 0; }
    if (!owner && user.aiN >= lim) return { ok: false, left: 0 };
    user.aiN++; return { ok: true, left: owner ? Infinity : lim - user.aiN };
  }
  /**
   * opts: { text, system, history:[{role,text}], image:{mime,data}, json:boolean, model:'auto'|alias, temperature, maxTokens }
   * Prueba modelo por modelo y clave por clave. Lanza Error con .code si no hay forma.
   */
  async ask(opts) {
    if (!this.hasKeys) { const e = new Error('No hay API keys de Gemini configuradas'); e.code = 'NOKEY'; throw e; }
    const pref = opts.model || this.db.data.settings.model || 'auto';
    const contents = [...(opts.history || []).map(h => ({ role: h.role === 'model' ? 'model' : 'user', parts: [{ text: h.text }] }))];
    const parts = [{ text: opts.text }]; if (opts.image) parts.push({ inline_data: { mime_type: opts.image.mime, data: opts.image.data } });
    contents.push({ role: 'user', parts });
    const persona = PERSONAS[this.db.data.settings.persona] || PERSONAS.yoru;
    const body = { contents, systemInstruction: { parts: [{ text: opts.system || persona.sys }] }, generationConfig: { temperature: opts.temperature ?? 0.8, maxOutputTokens: opts.maxTokens || 1200 } };
    if (opts.json) body.generationConfig.responseMimeType = 'application/json';
    let lastErr = null; const now = () => Date.now();
    for (const m of this.chain(pref)) {
      if ((this.modelDown.get(m.id) || 0) > now() && pref === 'auto') continue;
      for (let tries = 0; tries < Math.max(1, this.cfg.geminiKeys.length); tries++) {
        const key = this.nextKey(); if (!key) break;
        try {
          const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 45000);
          const res = await this.fetch(`${API}${m.id}:generateContent`, { method: 'POST', signal: ctl.signal, headers: { 'content-type': 'application/json', 'x-goog-api-key': key }, body: JSON.stringify(body) });
          clearTimeout(to);
          if (res.status === 429) { this.keyDown.set(key, now() + 60000); lastErr = new Error('Límite de cuota (429)'); continue; }
          if (res.status === 400 || res.status === 403) { const t = await res.text().catch(() => ''); if (/API key|PERMISSION|expired/i.test(t)) { this.keyDown.set(key, now() + 3600000); lastErr = new Error('API key no válida'); continue; } throw new Error('Solicitud rechazada: ' + t.slice(0, 120)); }
          if (res.status === 404) { this.modelDown.set(m.id, now() + 3600000); lastErr = new Error('Modelo no disponible: ' + m.id); break; }
          if (res.status >= 500) { this.modelDown.set(m.id, now() + 30000); lastErr = new Error('Servidor ocupado (' + res.status + ')'); break; }
          const j = await res.json();
          const cand = j.candidates && j.candidates[0], text = cand && cand.content && cand.content.parts ? cand.content.parts.map(p => p.text || '').join('').trim() : '';
          if (!text) { lastErr = new Error(j.promptFeedback && j.promptFeedback.blockReason ? 'Contenido bloqueado por seguridad' : 'Respuesta vacía'); if (j.promptFeedback) { lastErr.code = 'BLOCKED'; throw lastErr; } break; }
          this.last = { model: m.id, at: now(), ok: true, err: '' }; this.db.data.stats.ai++; this.db.save();
          return { text, model: m.id, alias: m.alias, fellBack: pref !== 'auto' && m.alias !== pref };
        } catch (e) {
          if (e.code === 'BLOCKED') throw e;
          lastErr = e.name === 'AbortError' ? new Error('Tiempo de espera agotado') : /fetch failed|ENOTFOUND|ECONN|network/i.test(e.message) ? new Error('Sin conexión con Gemini (revisa el internet)') : e;
        }
      }
    }
    this.last = { model: '', at: now(), ok: false, err: lastErr ? lastErr.message : 'desconocido' };
    const e = new Error(lastErr ? lastErr.message : 'No se pudo consultar a la IA'); e.code = 'FAIL'; throw e;
  }
}
module.exports = Gemini;
