'use strict';
const { jidNum, fmtMs, digits } = require('./util');

/** Saca el texto de un mensaje de Baileys (incluye mensajes efímeros/ver una vez y pies de foto). */
function unwrap(m) {
  let x = m || {};
  for (let i = 0; i < 4; i++) { const n = x.ephemeralMessage || x.viewOnceMessage || x.viewOnceMessageV2 || x.documentWithCaptionMessage; if (n && n.message) x = n.message; else break; }
  return x;
}
function textOf(m) {
  const x = unwrap(m);
  return (x.conversation || (x.extendedTextMessage && x.extendedTextMessage.text) || (x.imageMessage && x.imageMessage.caption) || (x.videoMessage && x.videoMessage.caption) ||
    (x.buttonsResponseMessage && x.buttonsResponseMessage.selectedButtonId) || (x.listResponseMessage && x.listResponseMessage.singleSelectReply && x.listResponseMessage.singleSelectReply.selectedRowId) || '').trim();
}
const ctxInfo = m => { const x = unwrap(m); for (const k of Object.keys(x)) if (x[k] && x[k].contextInfo) return x[k].contextInfo; return {}; };

/** Separa prefijo, comando y argumentos. Devuelve null si no es un comando. */
function parse(text, prefixes) {
  const p = prefixes.find(p => text.startsWith(p)); if (!p) return null;
  const rest = text.slice(p.length).trim(); if (!rest) return null;
  const [name, ...a] = rest.split(/\s+/);
  const body = rest.slice(name.length).trim();
  return { prefix: p, name: name.toLowerCase().replace(/[^\p{L}\p{N}_]/gu, ''), args: a, body };
}

function createHandler(app) {
  const { cfg, db, log, gemini, registry } = app;
  const cool = new Map(), flood = new Map(), sent = new Set(), metaCache = new Map();
  app.recent = app.recent || {};

  async function groupMeta(sock, jid) {
    const c = metaCache.get(jid); if (c && Date.now() - c.t < 60000) return c.m;
    const m = await sock.groupMetadata(jid); metaCache.set(jid, { t: Date.now(), m }); return m;
  }
  const trackSent = r => { if (r && r.key && r.key.id) { sent.add(r.key.id); if (sent.size > 600) sent.delete(sent.values().next().value); } return r; };

  async function handle(sock, msg) {
    if (!msg.message || !msg.key || msg.key.remoteJid === 'status@broadcast') return;
    if (sent.has(msg.key.id)) return;
    const jid = msg.key.remoteJid, isGroup = jid.endsWith('@g.us');
    const sender = jidNum(isGroup ? (msg.key.participant || msg.participant) : (msg.key.fromMe ? sock.user && sock.user.id : jid));
    const text = textOf(msg.message), info = ctxInfo(msg.message);
    const isOwner = cfg.owners.includes(sender) || !!msg.key.fromMe;
    if (!sender) return;
    const user = db.user(sender); if (msg.pushName) user.name = msg.pushName;

    if (isGroup && text) { const r = app.recent[jid] || (app.recent[jid] = []); r.push(`${user.name || sender}: ${text.slice(0, 300)}`); if (r.length > 80) r.shift(); }
    if (db.data.banned[sender] && !isOwner) return;
    const g = isGroup ? db.group(jid) : null;
    const reply = async (t, o = {}) => trackSent(await sock.sendMessage(jid, { text: String(t), ...o }, { quoted: msg }));
    const ctxBase = { sock, msg, jid, sender, isGroup, isOwner, user, group: g, text, info };

    // moderación pasiva en grupos
    if (isGroup && text) {
      if (g.muted.includes(sender) && !isOwner) { sock.sendMessage(jid, { delete: msg.key }).catch(() => {}); return; }
      if (g.antilink && /(https?:\/\/|chat\.whatsapp\.com\/)\S+/i.test(text) && !isOwner) {
        try { const meta = await groupMeta(sock, jid); const adm = meta.participants.find(p => jidNum(p.id) === sender && p.admin); if (!adm) { sock.sendMessage(jid, { delete: msg.key }).catch(() => {}); await reply('🛡️ Los enlaces no están permitidos aquí.'); return; } } catch {}
      }
      if (g.levels && !text.startsWith(cfg.prefixes[0])) { user.xp += 2; const need = user.lvl * 120; if (user.xp >= need) { user.xp -= need; user.lvl++; user.coins += 25 * user.lvl; reply(`✨ @${sender} subió al nivel *${user.lvl}* (+${25 * user.lvl} 🪙)`, { mentions: [sender + '@s.whatsapp.net'] }).catch(() => {}); } db.save(); }
    }

    const p = parse(text, cfg.prefixes); if (!p) return;
    const cmd = registry.reg.get(p.name); if (!cmd) return;
    if (db.data.settings.paused && !isOwner) return;
    if (db.data.settings.maintenance && !isOwner) return reply('🛠️ El bot está en mantenimiento. Vuelve en un rato.');

    // permisos
    let isAdmin = false, botAdmin = false, meta = null;
    if (isGroup) { try { meta = await groupMeta(sock, jid); const me = jidNum(sock.user && sock.user.id); isAdmin = isOwner || meta.participants.some(x => jidNum(x.id) === sender && x.admin); botAdmin = meta.participants.some(x => jidNum(x.id) === me && x.admin); } catch {} }
    const premium = user.premium > Date.now();
    if (cmd.perm === 'O' && !isOwner) return reply('♛ Solo el owner puede usar este comando.');
    if (cmd.perm === 'A' && isGroup && !isAdmin) return reply('⛨ Solo los admins del grupo pueden usar esto.');
    if (cmd.perm === 'A' && !isGroup && !isOwner) return reply('☷ Este comando es solo para grupos.');
    if (cmd.perm === 'P' && !premium && !isOwner) return reply('★ Comando premium. Pídele acceso al owner.');
    if (cmd.group && !isGroup) return reply('☷ Este comando es solo para grupos.');
    if (cmd.botAdmin && !botAdmin) return reply('⚠️ Necesito ser admin del grupo para hacer eso.');

    // anti-spam y cooldown
    const now = Date.now(), fl = (flood.get(sender) || []).filter(t => now - t < 10000); fl.push(now); flood.set(sender, fl);
    if (fl.length > 8 && !isOwner) return;
    const ck = sender + ':' + cmd.name, left = (cool.get(ck) || 0) - now;
    if (left > 0 && !isOwner) return reply(`⏳ Espera ${fmtMs(left) === '0m' ? 'un momento' : Math.ceil(left / 1000) + ' s'} para usar */${cmd.name}* otra vez.`);
    cool.set(ck, now + cmd.cd * 1000);

    const quoted = info.quotedMessage ? { key: { remoteJid: jid, id: info.stanzaId, participant: info.participant }, message: info.quotedMessage } : null;
    const ctx = { ...ctxBase, ...p, cmd, isAdmin, botAdmin, meta, premium, app, cfg, db, gemini, log, registry,
      mentioned: (info.mentionedJid || []).map(jidNum), quotedMsg: quoted, quotedText: quoted ? textOf(info.quotedMessage) : '', quotedSender: info.participant ? jidNum(info.participant) : '',
      reply, send: async (c, o) => trackSent(await sock.sendMessage(jid, c, { quoted: msg, ...o })),
      react: e => sock.sendMessage(jid, { react: { text: e, key: msg.key } }).catch(() => {}),
      /** destino de una acción: mención > respuesta > número escrito */
      target() { const t = this.mentioned[0] || this.quotedSender || digits(this.args.find(a => digits(a).length >= 7) || ''); return t || null; },
      jidOf: n => n + '@s.whatsapp.net',
      media: async () => { const m = quoted ? quoted.message : msg.message; const x = unwrap(m); const k = Object.keys(x).find(k => /imageMessage|stickerMessage/.test(k)); if (!k) return null;
        const { downloadMediaMessage } = require('@whiskeysockets/baileys'); const buf = await downloadMediaMessage({ key: quoted ? quoted.key : msg.key, message: m }, 'buffer', {}); return { buf, mime: x[k].mimetype || 'image/jpeg' }; },
      typing: () => sock.sendPresenceUpdate('composing', jid).catch(() => {}) };
    try {
      await cmd.run(ctx);
      db.data.stats.cmds++; user.cmds++; db.data.stats.byCmd[cmd.name] = (db.data.stats.byCmd[cmd.name] || 0) + 1; db.save();
    } catch (e) {
      db.data.stats.errors++; log.error('/' + cmd.name, e.message);
      await reply(e.code === 'USAGE' ? e.message : e.code === 'NOKEY' ? '🔑 La IA no está configurada todavía (faltan las API keys de Gemini).' : e.code === 'FAIL' || e.code === 'BLOCKED' ? '🌧️ ' + e.message : '⚠️ Algo falló con */' + cmd.name + '*. Inténtalo de nuevo.').catch(() => {});
    }
  }
  return { handle, trackSent, groupMeta };
}
const usage = m => Object.assign(new Error(m), { code: 'USAGE' });
module.exports = { createHandler, parse, textOf, unwrap, usage };
