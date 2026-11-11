'use strict';
const { fmtMs, rand, pick } = require('../core/util');
const { usage, num } = require('../core/helpers');
const SHOP = { pocion: ['🧪 Poción', 80], amuleta: ['🧿 Amuleta (protege de robos 1 vez)', 250], ticket: ['🎟️ Ticket dorado', 500], gorra: ['🧢 Gorra de gato', 120] };
const money = n => Math.floor(n).toLocaleString('es') + ' 🪙';
module.exports = [
  { cat: 'eco', name: 'saldo', alias: ['bal'], async run(c) { const t = c.target(), u = t ? c.db.user(t) : c.user; await c.reply(`💰 *${t ? '@' + t : 'Tu saldo'}*\nCartera: ${money(u.coins)}\nBanco: ${money(u.bank)}\nNivel: ${u.lvl}`, { mentions: t ? [c.jidOf(t)] : [] }); } },
  { cat: 'eco', name: 'diario', cd: 2, async run(c) { const u = c.user, now = Date.now(), gap = now - u.daily;
    if (gap < 72e5 * 12) return c.reply('🎁 Ya reclamaste hoy. Vuelve en ' + fmtMs(864e5 - gap));
    u.streak = gap < 1728e5 ? u.streak + 1 : 1; const g = 100 + Math.min(u.streak, 30) * 15; u.coins += g; u.daily = now; c.db.save(); await c.reply(`🎁 +${money(g)}\n🔥 Racha: ${u.streak} día(s)`); } },
  { cat: 'eco', name: 'trabajar', alias: ['work'], async run(c) { const u = c.user, gap = Date.now() - u.work; if (gap < 36e5) return c.reply('😴 Estás cansad@. Vuelve en ' + fmtMs(36e5 - gap)); const g = rand(40, 140);
    u.coins += g; u.work = Date.now(); c.db.save(); await c.reply(`🛠️ ${pick(['Repartiste ramen', 'Programaste un bot', 'Cuidaste gatos', 'Vendiste figuras', 'Dibujaste comisiones'])} y ganaste ${money(g)}`); } },
  { cat: 'eco', name: 'enviar', async run(c) { const t = c.target(), n = Math.floor(num(c.args.find(a => /^\d+$/.test(a)), 0)); if (!t || n < 1) throw usage('Uso: */enviar @usuario 100*'); if (t === c.sender) throw usage('No puedes enviarte a ti mism@.'); if (c.user.coins < n) throw usage('No te alcanza.');
    c.user.coins -= n; c.db.user(t).coins += n; c.db.save(); await c.reply(`✅ Enviaste ${money(n)} a @${t}`, { mentions: [c.jidOf(t)] }); } },
  { cat: 'eco', name: 'banco', async run(c) { const [a, v] = c.args, u = c.user; if (!a) return c.reply(`🏦 Banco: ${money(u.bank)}\nUsa */banco depositar 100* o */banco retirar 100* (también "todo").`);
    const n = v === 'todo' ? (a.startsWith('d') ? u.coins : u.bank) : Math.floor(num(v, 0)); if (n < 1) throw usage('Indica una cantidad.');
    if (a.startsWith('d')) { if (u.coins < n) throw usage('No tienes tanto.'); u.coins -= n; u.bank += n; } else if (a.startsWith('r')) { if (u.bank < n) throw usage('No tienes tanto en el banco.'); u.bank -= n; u.coins += n; } else throw usage('Usa depositar o retirar.');
    c.db.save(); await c.reply(`🏦 Hecho. Cartera ${money(u.coins)} · Banco ${money(u.bank)}`); } },
  { cat: 'eco', name: 'apostar', async run(c) { const n = Math.floor(num(c.args[0] === 'todo' ? c.user.coins : c.args[0], 0)); if (n < 10) throw usage('Uso: */apostar 50* (mínimo 10)'); if (n > c.user.coins) throw usage('No tienes tanto.');
    const w = Math.random() < .45; c.user.coins += w ? n : -n; c.db.save(); await c.reply(w ? `🎰 ¡Ganaste ${money(n)}!` : `🎰 Perdiste ${money(n)}…`); } },
  { cat: 'eco', name: 'robar', cd: 600, group: true, async run(c) { const t = c.target(); if (!t || t === c.sender) throw usage('Uso: */robar @usuario*'); const v = c.db.user(t);
    if (v.inv.amuleta) { v.inv.amuleta--; c.db.save(); return c.reply('🧿 ¡La amuleta de la víctima te frenó!'); }
    if (v.coins < 50) return c.reply('Esa persona no tiene casi nada.'); if (Math.random() < .5) { const g = Math.floor(v.coins * rand(5, 20) / 100); v.coins -= g; c.user.coins += g; c.db.save(); return c.reply(`🥷 Robaste ${money(g)} a @${t}`, { mentions: [c.jidOf(t)] }); }
    const f = Math.min(c.user.coins, 60); c.user.coins -= f; c.db.save(); await c.reply(`🚨 Te atraparon y pagaste ${money(f)} de multa.`); } },
  { cat: 'eco', name: 'tienda', async run(c) { await c.reply('🛍️ *Tienda*\n' + Object.entries(SHOP).map(([k, [n, p]]) => `• ${k} — ${n} · ${money(p)}`).join('\n') + '\n\nCompra con */comprar pocion*'); } },
  { cat: 'eco', name: 'comprar', async run(c) { const k = (c.args[0] || '').toLowerCase(), q = Math.max(1, parseInt(c.args[1]) || 1), it = SHOP[k]; if (!it) throw usage('Mira */tienda* y usa */comprar <objeto> [cantidad]*'); const cost = it[1] * q; if (c.user.coins < cost) throw usage('Te faltan ' + money(cost - c.user.coins));
    c.user.coins -= cost; c.user.inv[k] = (c.user.inv[k] || 0) + q; c.db.save(); await c.reply(`✅ Compraste ${q}× ${it[0]} por ${money(cost)}`); } },
  { cat: 'eco', name: 'mochila', async run(c) { const e = Object.entries(c.user.inv).filter(([, n]) => n > 0); await c.reply('🎒 *Mochila*\n' + (e.length ? e.map(([k, n]) => `• ${SHOP[k] ? SHOP[k][0] : k} × ${n}`).join('\n') : 'Vacía. Visita */tienda*.')); } },
  { cat: 'eco', name: 'riqueza', alias: ['ranking'], async run(c) { const t = Object.entries(c.db.data.users).sort((a, b) => b[1].coins + b[1].bank - a[1].coins - a[1].bank).slice(0, 10);
    await c.reply('🏆 *Más ricos*\n' + t.map(([id, u], i) => `${i + 1}. ${u.name || '+' + id} — ${money(u.coins + u.bank)}`).join('\n')); } }
];
