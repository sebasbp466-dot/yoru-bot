'use strict';
const fs = require('fs');
const { usage } = require('../core/helpers');
const O = { perm: 'O', cat: 'owner' };
const who = c => { const t = c.target(); if (!t) throw usage('Menciona, responde o escribe el número.'); return t; };
module.exports = [
  { ...O, name: 'vetar', async run(c) { const t = who(c); if (c.cfg.owners.includes(t)) throw usage('No puedes vetar a un owner.'); c.db.data.banned[t] = Date.now(); c.db.save(); await c.reply('🚫 +' + t + ' vetad@.'); } },
  { ...O, name: 'indultar', async run(c) { const t = who(c); delete c.db.data.banned[t]; c.db.save(); await c.reply('✅ +' + t + ' indultad@.'); } },
  { ...O, name: 'premium', async run(c) { const a = (c.args[0] || '').toLowerCase(), t = who(c); const u = c.db.user(t);
    if (a === 'quitar') { u.premium = 0; c.db.save(); return c.reply('✅ Premium retirado.'); }
    if (a !== 'dar') throw usage('Uso: */premium dar @usuario 30d* o */premium quitar @usuario*'); const d = parseInt((c.body.match(/(\d+)\s*d/) || [])[1]) || 30; u.premium = Math.max(u.premium, Date.now()) + d * 864e5; c.db.save(); await c.reply(`★ +${t} es premium por ${d} día(s).`); } },
  { ...O, name: 'mantenimiento', async run(c) { const v = (c.args[0] || '').toLowerCase(); if (!['on', 'off'].includes(v)) throw usage('Uso: */mantenimiento on|off*'); c.db.data.settings.maintenance = v === 'on'; c.db.save(); await c.reply('🛠️ Mantenimiento: ' + v); } },
  { ...O, name: 'registros', async run(c) { await c.reply('```\n' + c.log.tail(Math.min(60, parseInt(c.args[0]) || 25)).join('\n').slice(-3500) + '\n```'); } },
  { ...O, name: 'reiniciar', async run(c) { await c.reply('♻️ Reiniciando la conexión…'); setTimeout(() => c.app.restart(), 500); } },
  { ...O, name: 'bio', async run(c) { if (!c.body) throw usage('Uso: */bio Yoru en línea*'); await c.sock.updateProfileStatus(c.body.slice(0, 139)); await c.reply('✅ Bio actualizada.'); } },
  { ...O, name: 'difundir', cd: 60, async run(c) { if (!c.body) throw usage('Uso: */difundir mensaje*'); const gs = Object.keys(await c.sock.groupFetchAllParticipating()); let n = 0; for (const g of gs) { await c.sock.sendMessage(g, { text: '📢 *Aviso*\n' + c.body }).then(() => n++).catch(() => {}); await new Promise(r => setTimeout(r, 1500)); } await c.reply(`📢 Enviado a ${n}/${gs.length} grupos.`); } },
  { ...O, name: 'entrar', async run(c) { const m = c.body.match(/chat\.whatsapp\.com\/([A-Za-z0-9]+)/); if (!m) throw usage('Uso: */entrar https://chat.whatsapp.com/…*'); await c.sock.groupAcceptInvite(m[1]); await c.reply('✅ Unido al grupo.'); } },
  { ...O, name: 'salir', group: true, async run(c) { await c.reply('👋 ¡Hasta pronto!'); await c.sock.groupLeave(c.jid); } },
  { ...O, name: 'respaldo', cd: 30, async run(c) { c.db.flush(); await c.sock.sendMessage(c.jid, { document: fs.readFileSync(c.db.file), fileName: 'yoru-db-' + new Date().toISOString().slice(0, 10) + '.json', mimetype: 'application/json' }, { quoted: c.msg }); } }
];
