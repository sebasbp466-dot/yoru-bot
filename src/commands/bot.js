'use strict';
const { sendMenu } = require('../core/interactive');
const { fmtMs } = require('../core/util');
const { usage } = require('../core/helpers');
const CATN = { ia: 'IA', estudio: 'Estudio', grupo: 'Grupo', mod: 'Moderación', dl: 'Descargas', music: 'Audio', juegos: 'Juegos', rpg: 'Aventura', gacha: 'Cartas', eco: 'Economía', anime: 'Anime', stick: 'Edición', tools: 'Utilidades', prod: 'Productividad', info: 'Mundo', fun: 'Diversión', bot: 'Bot', owner: 'Owner' };
module.exports = [
  { cat: 'bot', name: 'menu', alias: ['menú', 'help', 'start'], cd: 5, async run(c) { await sendMenu(c.sock, c.jid, c.msg, c.cfg); } },
  { cat: 'bot', name: 'ping', cd: 3, async run(c) { const t = Date.now(); const m = await c.reply('🏓 …'); await c.sock.sendMessage(c.jid, { text: `🏓 Pong · ${Date.now() - t} ms`, edit: m.key }).catch(() => c.reply(`🏓 ${Date.now() - t} ms`)); } },
  { cat: 'bot', name: 'estado', alias: ['status'], async run(c) {
    const s = c.app.status(), ai = s.ai;
    await c.reply(`✦ *${s.bot}* v${s.version}\n• Conexión: ${s.conn}\n• Activo hace: ${fmtMs(s.uptime)}\n• Modelo IA: ${ai.pref} (${ai.last.model || 'sin uso aún'})\n• Comandos usados: ${s.stats.cmds}\n• Usuarios: ${s.stats.users} · Grupos: ${s.stats.groups}\n• Memoria: ${s.mem} MB`); } },
  { cat: 'bot', name: 'ayuda', async run(c) {
    const q = (c.args[0] || '').toLowerCase().replace(/^\//, '');
    if (q) { const k = c.registry.reg.get(q); if (!k) throw usage('No encontré ese comando. Prueba */ayuda* para ver las categorías.');
      return c.reply(`*${c.prefix}${k.name}*${k.alias.length ? ' (' + k.alias.map(a => c.prefix + a).join(', ') + ')' : ''}\n${k.desc || ''}\nEjemplo: ${k.ex || c.prefix + k.name}\nPermiso: ${{ T: 'todos', A: 'admins', O: 'owner', P: 'premium' }[k.perm]}${k.stub ? '\n🚧 En construcción' : ''}`); }
    const by = {}; for (const k of c.registry.list) if (!k.stub) (by[k.cat] = by[k.cat] || []).push(k.name);
    await c.reply('📖 *Comandos listos*\n' + Object.keys(by).map(k => `\n*${CATN[k] || k}* — ${by[k].map(n => c.prefix + n).join(' ')}`).join('') + `\n\nDetalle: ${c.prefix}ayuda <comando>\nMenú visual: ${c.prefix}menu`); } },
  { cat: 'bot', name: 'version', async run(c) { await c.reply(`✦ ${c.cfg.botName} v${require('../../package.json').version} · ${c.registry.ready} comandos listos`); } },
  { cat: 'bot', name: 'prefijo', perm: 'O', async run(c) { if (!c.args[0]) return c.reply('Prefijos actuales: ' + c.cfg.prefixes.join(' ')); c.cfg.prefixes = c.args.slice(0, 4); require('../core/config').save(c.cfg); await c.reply('✅ Prefijos: ' + c.cfg.prefixes.join(' ')); } },
  { cat: 'bot', name: 'reportar', cd: 30, async run(c) { if (!c.body) throw usage('Cuéntame el problema: */reportar el comando X falla*'); for (const o of c.cfg.owners) await c.sock.sendMessage(o + '@s.whatsapp.net', { text: `🐞 Reporte de @${c.sender}:\n${c.body}`, mentions: [c.sender + '@s.whatsapp.net'] }).catch(() => {}); await c.reply('✅ Enviado al equipo. ¡Gracias!'); } },
  { cat: 'bot', name: 'sugerir', cd: 30, async run(c) { if (!c.body) throw usage('Escribe tu idea: */sugerir un comando para…*'); for (const o of c.cfg.owners) await c.sock.sendMessage(o + '@s.whatsapp.net', { text: `💡 Sugerencia de @${c.sender}:\n${c.body}`, mentions: [c.sender + '@s.whatsapp.net'] }).catch(() => {}); await c.reply('✅ Idea enviada. ¡Gracias!'); } },
  { cat: 'bot', name: 'invitar', async run(c) { await c.reply(`✦ Prueba *${c.cfg.botName}*: escríbele *${c.prefix}menu* en privado o añádelo a tu grupo.`); } },
  { cat: 'bot', name: 'privacidad', async run(c) { await c.reply('🔒 Guardo solo lo necesario para funcionar: tus monedas, notas, tareas y el historial corto de la IA (10 mensajes). Los mensajes que le envías a la IA se mandan a Gemini (Google). Usa */memoria borrar* para limpiar tu historial.'); } }
];
