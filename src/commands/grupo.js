'use strict';
const { usage } = require('../core/helpers');
const { jidNum } = require('../core/util');
const G = { group: true, perm: 'A' };
const need = c => { const t = c.target(); if (!t) throw usage('Menciona a alguien o responde a su mensaje.'); return t; };
const act = (name, cat, action, ok, extra = {}) => ({ cat, name, ...G, botAdmin: true, async run(c) { const t = need(c); if (c.cfg.owners.includes(t)) throw usage('No puedo hacer eso con un owner.'); await c.sock.groupParticipantsUpdate(c.jid, [c.jidOf(t)], action); await c.reply(ok.replace('@u', '@' + t), { mentions: [c.jidOf(t)] }); } , ...extra });
const toggle = (name, key, label) => ({ cat: 'grupo', name, ...G, async run(c) { const v = (c.args[0] || '').toLowerCase(); if (!['on', 'off'].includes(v)) throw usage(`Uso: */${name} on* o */${name} off* (ahora: ${c.group[key] ? 'activado' : 'apagado'})`); c.group[key] = v === 'on'; c.db.save(); await c.reply(`✅ ${label}: ${v === 'on' ? 'activado' : 'apagado'}`); } });
module.exports = [
  act('expulsar', 'mod', 'remove', '👢 @u fue expulsad@.'), act('ascender', 'mod', 'promote', '⬆️ @u ahora es admin.'), act('degradar', 'mod', 'demote', '⬇️ @u ya no es admin.'),
  { cat: 'mod', name: 'abrir', ...G, botAdmin: true, async run(c) { await c.sock.groupSettingUpdate(c.jid, 'not_announcement'); await c.reply('🔓 Grupo abierto: todos pueden escribir.'); } },
  { cat: 'mod', name: 'cerrar', ...G, botAdmin: true, async run(c) { await c.sock.groupSettingUpdate(c.jid, 'announcement'); await c.reply('🔒 Grupo cerrado: solo admins.'); } },
  { cat: 'mod', name: 'enlace', ...G, botAdmin: true, async run(c) { await c.reply('🔗 https://chat.whatsapp.com/' + await c.sock.groupInviteCode(c.jid)); } },
  { cat: 'mod', name: 'renovar', ...G, botAdmin: true, async run(c) { await c.sock.groupRevokeInvite(c.jid); await c.reply('♻️ Enlace renovado.'); } },
  { cat: 'mod', name: 'borrar', ...G, botAdmin: true, async run(c) { if (!c.quotedMsg) throw usage('Responde al mensaje que quieres borrar.'); await c.sock.sendMessage(c.jid, { delete: { remoteJid: c.jid, id: c.info.stanzaId, participant: c.info.participant } }); } },
  { cat: 'mod', name: 'llamar', alias: ['todos'], ...G, async run(c) { const ids = c.meta.participants.map(p => p.id); await c.reply('📣 ' + (c.body || 'Atención, por favor') + '\n\n' + ids.map(i => '@' + jidNum(i)).join(' '), { mentions: ids }); } },
  { cat: 'mod', name: 'avisar', ...G, async run(c) { const t = need(c), w = c.group.warns[t] = (c.group.warns[t] || 0) + 1; c.db.save();
    if (w >= 3 && c.botAdmin && !c.cfg.owners.includes(t)) { await c.sock.groupParticipantsUpdate(c.jid, [c.jidOf(t)], 'remove'); c.group.warns[t] = 0; return c.reply(`🚫 @${t} llegó a 3 avisos y fue expulsad@.`, { mentions: [c.jidOf(t)] }); }
    await c.reply(`⚠️ Aviso ${w}/3 para @${t}${c.args.length > 1 ? '\nMotivo: ' + c.args.slice(1).join(' ') : ''}`, { mentions: [c.jidOf(t)] }); } },
  { cat: 'mod', name: 'avisos', ...G, async run(c) { const t = c.target(), w = c.group.warns; await c.reply(t ? `⚠️ @${t}: ${w[t] || 0}/3` : '⚠️ *Avisos*\n' + (Object.entries(w).filter(([, n]) => n).map(([k, n]) => `• @${k}: ${n}/3`).join('\n') || 'Nadie tiene avisos.'), { mentions: t ? [c.jidOf(t)] : Object.keys(w).map(c.jidOf) }); } },
  { cat: 'mod', name: 'perdonar', ...G, async run(c) { const t = need(c); c.group.warns[t] = 0; c.db.save(); await c.reply(`🕊️ Avisos de @${t} reiniciados.`, { mentions: [c.jidOf(t)] }); } },
  { cat: 'mod', name: 'silenciar', ...G, botAdmin: true, async run(c) { const t = need(c); if (!c.group.muted.includes(t)) c.group.muted.push(t); c.db.save(); await c.reply(`🤐 @${t} silenciad@ (borraré sus mensajes).`, { mentions: [c.jidOf(t)] }); } },
  { cat: 'mod', name: 'hablar', ...G, async run(c) { const t = need(c); c.group.muted = c.group.muted.filter(x => x !== t); c.db.save(); await c.reply(`🔊 @${t} puede hablar de nuevo.`, { mentions: [c.jidOf(t)] }); } },
  toggle('escudo', 'antilink', 'Escudo anti-enlaces'), toggle('portero', 'welcome', 'Bienvenidas'), toggle('niveles', 'levels', 'Niveles y XP'),
  { cat: 'grupo', name: 'bienvenida', ...G, async run(c) { if (!c.body) return c.reply('Mensaje actual:\n' + c.group.wmsg + '\n\nCámbialo con */bienvenida texto*. Variables: @user @grupo @n'); c.group.wmsg = c.body.slice(0, 400); c.db.save(); await c.reply('✅ Bienvenida actualizada.'); } },
  { cat: 'grupo', name: 'despedida', ...G, async run(c) { if (!c.body) return c.reply('Mensaje actual:\n' + c.group.bmsg + '\n\nCámbialo con */despedida texto*.'); c.group.bmsg = c.body.slice(0, 400); c.db.save(); await c.reply('✅ Despedida actualizada.'); } },
  { cat: 'grupo', name: 'setreglas', ...G, async run(c) { if (!c.body) throw usage('Uso: */setreglas 1. Respeto 2. Sin spam*'); c.group.rules = c.body.slice(0, 1200); c.db.save(); await c.reply('✅ Reglas guardadas.'); } },
  { cat: 'grupo', name: 'reglas', group: true, async run(c) { await c.reply(c.group.rules ? '📜 *Reglas*\n' + c.group.rules : 'Este grupo aún no tiene reglas. Un admin puede usar */setreglas*.'); } },
  { cat: 'grupo', name: 'tablero', group: true, async run(c) { const ids = new Set(c.meta.participants.map(p => jidNum(p.id))); const t = Object.entries(c.db.data.users).filter(([id]) => ids.has(id)).sort((a, b) => b[1].lvl * 1e4 + b[1].xp - a[1].lvl * 1e4 - a[1].xp).slice(0, 10);
    await c.reply('🏅 *Tablero del grupo*\n' + (t.map(([id, u], i) => `${i + 1}. ${u.name || '+' + id} — nv ${u.lvl}`).join('\n') || 'Aún sin datos.')); } }
];
