'use strict';
const ring = []; const MAX = 400;
function push(lv, args) {
  const line = `${new Date().toISOString().slice(11, 19)} ${lv} ${args.map(a => a instanceof Error ? a.message : typeof a === 'string' ? a : JSON.stringify(a)).join(' ')}`;
  ring.push(line); if (ring.length > MAX) ring.shift();
  (lv === 'ERR' ? console.error : console.log)(line);
}
const log = { info: (...a) => push('INF', a), warn: (...a) => push('WRN', a), error: (...a) => push('ERR', a), tail: (n = 50) => ring.slice(-n), ring };
/** Logger mínimo compatible con lo que pide Baileys (pino-like) y silencioso. */
const quiet = { level: 'silent', child() { return quiet; }, trace() {}, debug() {}, info() {}, warn() {}, error() {}, fatal() {} };
module.exports = { log, quiet };
