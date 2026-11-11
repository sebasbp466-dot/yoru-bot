'use strict';
const fs = require('fs'), path = require('path');
class DB {
  constructor(dir) {
    this.file = path.join(dir, 'db.json'); fs.mkdirSync(dir, { recursive: true });
    this.data = { users: {}, groups: {}, chats: {}, stats: { cmds: 0, ai: 0, errors: 0, byCmd: {} }, settings: { model: 'auto', persona: 'yoru', maintenance: false, paused: false }, timers: [], banned: {} };
    try { const d = JSON.parse(fs.readFileSync(this.file, 'utf8')); this.data = { ...this.data, ...d, stats: { ...this.data.stats, ...(d.stats || {}) }, settings: { ...this.data.settings, ...(d.settings || {}) } }; } catch {}
    this._t = null;
  }
  user(id) { return this.data.users[id] || (this.data.users[id] = { coins: 100, bank: 0, xp: 0, lvl: 1, premium: 0, daily: 0, streak: 0, work: 0, aiDay: '', aiN: 0, notes: [], tasks: [], inv: {}, name: '', cmds: 0 }); }
  group(id) { return this.data.groups[id] || (this.data.groups[id] = { welcome: true, bye: true, wmsg: '¡Bienvenid@ @user a @grupo! Eres el miembro n.º @n. Lee las reglas con /reglas.', bmsg: 'Adiós @user 👋', rules: '', antilink: false, muted: [], warns: {}, levels: true }); }
  chat(id) { return this.data.chats[id] || (this.data.chats[id] = { hist: [] }); }
  save() { clearTimeout(this._t); this._t = setTimeout(() => this.flush(), 1500); }
  flush() { clearTimeout(this._t); try { const tmp = this.file + '.tmp'; fs.writeFileSync(tmp, JSON.stringify(this.data)); fs.renameSync(tmp, this.file); } catch (e) { console.error('db', e.message); } }
}
module.exports = DB;
