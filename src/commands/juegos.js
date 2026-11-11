'use strict';
const { pick, rand, jidNum } = require('../core/util');
const { usage } = require('../core/helpers');
const PPT = { piedra: '🪨', papel: '📄', tijera: '✂️' }, WIN = { piedra: 'tijera', papel: 'piedra', tijera: 'papel' };
const VERDAD = ['¿Cuál es tu mayor miedo?', '¿Qué es lo más vergonzoso que te ha pasado?', '¿A quién del grupo le pedirías un consejo importante?', '¿Cuál es tu anime favorito de todos los tiempos?', '¿Qué hábito tuyo te gustaría cambiar?', '¿Qué mentira piadosa dices más seguido?'];
const RETO = ['Envía un audio cantando 10 segundos.', 'Cambia tu foto de perfil por una de anime por 1 hora.', 'Escribe un haiku sobre el último mensaje del grupo.', 'Describe tu día usando solo emojis.', 'Imita a tu personaje favorito en un audio.', 'Di un cumplido sincero a quien quieras del grupo.'];
const ball = ['Sí, sin duda.', 'Todo apunta a que sí.', 'Quizás… pregúntame luego.', 'Mejor no cuentes con ello.', 'Mis fuentes dicen que no.', 'Ahora mismo no lo veo claro.', 'Definitivamente sí.', 'No lo creo.'];
module.exports = [
  { cat: 'juegos', name: 'dado', async run(c) { const n = Math.min(100, Math.max(2, parseInt(c.args[0]) || 6)); await c.reply(`🎲 Salió *${rand(1, n)}* (d${n})`); } },
  { cat: 'juegos', name: 'moneda', async run(c) { await c.reply(pick(['🪙 *Cara*', '🪙 *Cruz*'])); } },
  { cat: 'juegos', name: 'ppt', async run(c) { const u = (c.args[0] || '').toLowerCase(); if (!PPT[u]) throw usage('Uso: */ppt piedra* (piedra, papel o tijera)'); const b = pick(Object.keys(PPT));
    const r = u === b ? 'Empate 🤝' : WIN[u] === b ? '¡Ganaste! 🎉 (+10 🪙)' : 'Perdiste 😼'; if (WIN[u] === b) c.user.coins += 10; c.db.save(); await c.reply(`${PPT[u]} vs ${PPT[b]}\n${r}`); } },
  { cat: 'juegos', name: 'ruleta', async run(c) { const o = c.body.split(/[,|]+/).map(s => s.trim()).filter(Boolean); if (o.length < 2) throw usage('Uso: */ruleta pizza, sushi, tacos*'); await c.reply('🎡 La ruleta eligió: *' + pick(o) + '*'); } },
  { cat: 'juegos', name: 'ship', group: true, async run(c) { const a = c.mentioned.slice(0, 2); if (a.length < 2) throw usage('Menciona a dos personas: */ship @a @b*'); const s = [...a].sort().join(''); let h = 0; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) % 101;
    await c.reply(`💞 @${a[0]} + @${a[1]} = *${h}%*\n${'█'.repeat(Math.round(h / 10))}${'░'.repeat(10 - Math.round(h / 10))}`, { mentions: a.map(c.jidOf) }); } },
  { cat: 'juegos', name: 'top', group: true, async run(c) { const t = c.body || 'más divertidos'; const ids = c.meta.participants.map(p => p.id).sort(() => Math.random() - .5).slice(0, 5); await c.reply(`🏆 *Top 5 ${t}*\n` + ids.map((i, k) => `${k + 1}. @${jidNum(i)}`).join('\n'), { mentions: ids }); } },
  { cat: 'juegos', name: 'verdad', async run(c) { await c.reply('💭 *Verdad:* ' + pick(VERDAD)); } },
  { cat: 'juegos', name: 'reto', async run(c) { await c.reply('🔥 *Reto:* ' + pick(RETO)); } },
  { cat: 'fun', name: 'bola8', alias: ['8ball'], async run(c) { if (!c.body) throw usage('Hazle una pregunta: */bola8 ¿aprobaré?*'); await c.reply('🎱 ' + pick(ball)); } },
  { cat: 'juegos', name: 'ahorcado', cd: 5, async run(c) { const W = ['sakura', 'katana', 'origami', 'samurai', 'ramen', 'kimono', 'estrella', 'montaña', 'guitarra', 'aventura'], g = c.db.chat('ah:' + c.jid);
    const l = (c.args[0] || '').toLowerCase();
    if (!g.w || l === 'nuevo') { g.w = pick(W); g.t = []; g.l = 7; c.db.save(); }
    else if (l.length === 1 && /\p{L}/u.test(l)) { if (!g.t.includes(l)) { g.t.push(l); if (!g.w.includes(l)) g.l--; } }
    else if (l.length > 1) { if (l === g.w) g.t = [...g.w]; else g.l--; }
    const shown = [...g.w].map(x => g.t.includes(x) ? x : '_').join(' '), won = [...g.w].every(x => g.t.includes(x));
    if (won || g.l <= 0) { const w = g.w; delete g.w; if (won) { c.user.coins += 30; } c.db.save(); return c.reply(won ? `🎉 ¡Era *${w}*! (+30 🪙)` : `💀 Perdiste. Era *${w}*.`); }
    c.db.save(); await c.reply(`🪢 ${shown}\nVidas: ${'❤️'.repeat(g.l)}\nUsadas: ${g.t.join(' ') || '—'}\nJuega con */ahorcado a*`); } }
];
