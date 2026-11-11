'use strict';
const { usage } = require('./handler');
const { PERSONAS } = require('./personas');
/** Consulta a la IA respetando el cupo diario del usuario. */
async function ai(c, text, o = {}) {
  const q = c.gemini.quota(c.user, c.premium, c.isOwner);
  if (!q.ok) throw Object.assign(new Error('Llegaste a tu límite diario de IA. Mañana se reinicia (o pide premium).'), { code: 'FAIL' });
  c.typing && c.typing();
  const r = await c.gemini.ask({ text, ...o });
  c.db.save();
  return r;
}
/** Crea un comando que solo rellena una plantilla de prompt. */
function aiCmd(def) {
  return { cat: def.cat, name: def.name, alias: def.alias || [], perm: def.perm || 'T', cd: def.cd ?? 6, desc: def.desc, ex: def.ex,
    async run(c) {
      const input = (c.body || c.quotedText || '').trim();
      if (!input && !def.optional) throw usage(`✎ Falta el texto.\nEjemplo: ${c.prefix}${def.name} ${def.hint || 'tu texto'}`);
      const r = await ai(c, def.prompt(input, c), { system: def.system, temperature: def.temp, maxTokens: def.max, model: def.model });
      await c.reply(r.text + (r.fellBack ? '\n\n_(usé otro modelo porque el elegido no respondió)_' : ''));
    } };
}
const need = (c, n, msg) => { if (c.args.length < n) throw usage(msg); };
const num = (s, d = NaN) => { const n = parseFloat(String(s).replace(/,/g, '.')); return isFinite(n) ? n : d; };
const tag = id => '@' + id;
module.exports = { ai, aiCmd, need, num, tag, usage, PERSONAS };
