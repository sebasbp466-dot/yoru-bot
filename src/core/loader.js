'use strict';
const fs = require('fs'), path = require('path');
/** Carga los comandos implementados y rellena el resto con los del menú (planned.json) como "en construcción". */
function loadCommands(log) {
  const reg = new Map(), list = [], dir = path.join(__dirname, '..', 'commands');
  const add = c => { if (!c.name || typeof c.run !== 'function') return; c.perm = c.perm || 'T'; c.cat = c.cat || 'bot'; c.alias = c.alias || []; c.cd = c.cd ?? 3;
    list.push(c); reg.set(c.name, c); for (const a of c.alias) if (!reg.has(a)) reg.set(a, c); };
  for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.js')).sort()) {
    try { for (const c of require(path.join(dir, f))) add(c); } catch (e) { log.error('comando', f, e.message); }
  }
  let planned = [];
  try { planned = JSON.parse(fs.readFileSync(path.join(__dirname, 'planned.json'), 'utf8')); } catch {}
  let stubs = 0;
  for (const p of planned) {
    const has = list.find(c => c.name === p.name);
    if (has) { has.desc = has.desc || p.desc; has.ex = has.ex || p.ex; has.cat = has.cat === 'bot' && p.cat !== 'bot' ? p.cat : has.cat; if (!has.alias.length && p.alias) for (const a of p.alias) if (!reg.has(a)) { reg.set(a, has); has.alias.push(a); } continue; }
    stubs++; add({ name: p.name, cat: p.cat, desc: p.desc, ex: p.ex, perm: p.perm, alias: p.alias || [], stub: true, run: async c => c.reply('🚧 */' + p.name + '* todavía está en construcción. Mira */menu* para lo que ya funciona.') });
  }
  log.info(`Comandos: ${list.length - stubs} listos, ${stubs} en construcción`);
  return { reg, list, ready: list.length - stubs, stubs };
}
module.exports = { loadCommands };
