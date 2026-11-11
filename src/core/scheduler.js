'use strict';
/** Recordatorios y temporizadores persistentes (db.data.timers). */
class Scheduler {
  constructor(db, send, log) { this.db = db; this.send = send; this.log = log; this.t = null; }
  add(t) { this.db.data.timers.push({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5), ...t }); this.db.save(); }
  start() { this.stop(); this.t = setInterval(() => this.tick().catch(e => this.log.error('timer', e.message)), 10000); }
  stop() { clearInterval(this.t); }
  async tick() {
    const now = Date.now(), due = this.db.data.timers.filter(t => t.at <= now);
    if (!due.length) return;
    this.db.data.timers = this.db.data.timers.filter(t => t.at > now); this.db.save();
    for (const t of due) { try { await this.send(t); } catch (e) { this.log.warn('recordatorio no enviado', e.message); } }
  }
}
module.exports = Scheduler;
