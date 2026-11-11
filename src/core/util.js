'use strict';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const digits = s => String(s || '').replace(/\D/g, '');
const jidNum = jid => digits(String(jid || '').split('@')[0].split(':')[0]);
const pick = a => a[Math.floor(Math.random() * a.length)];
const rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const fmtMs = ms => {
  const s = Math.max(0, Math.round(ms / 1000)), d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60);
  return [d && d + 'd', h && h + 'h', (m || (!d && !h)) && m + 'm'].filter(Boolean).join(' ');
};
/** "10m", "2h", "1d 30m", "45s" → milisegundos (null si no entiende) */
function parseDuration(str) {
  const re = /(\d+(?:\.\d+)?)\s*(s|seg|m|min|h|hr|d|dia|días|dias)\b/gi; let ms = 0, ok = false, x;
  const U = { s: 1e3, seg: 1e3, m: 6e4, min: 6e4, h: 36e5, hr: 36e5, d: 864e5, dia: 864e5, días: 864e5, dias: 864e5 };
  while ((x = re.exec(str))) { ms += parseFloat(x[1]) * U[x[2].toLowerCase()]; ok = true; }
  return ok ? Math.round(ms) : null;
}
/** Evalúa expresiones matemáticas simples sin acceso a nada más. */
function calc(expr) {
  const e = String(expr).replace(/,/g, '.').replace(/\^/g, '**').replace(/×/g, '*').replace(/÷/g, '/').replace(/\bpi\b/gi, 'Math.PI').replace(/\be\b/g, 'Math.E')
    .replace(/\b(sqrt|sin|cos|tan|log|abs|round|floor|ceil)\b/g, 'Math.$1');
  if (!/^[\d\s+\-*/().%,Math.PIEsqrtincoablgfldeuh]+$/.test(e) || /(?:\*\*\s*){2,}/.test(e) || e.length > 120) throw new Error('Expresión no válida');
  const stripped = e.replace(/Math\.(PI|E|sqrt|sin|cos|tan|log|abs|round|floor|ceil)/g, '');
  if (/[a-zA-Z_$]/.test(stripped)) throw new Error('Expresión no válida');
  const r = Function('"use strict";return (' + e + ')')();
  if (typeof r !== 'number' || !isFinite(r)) throw new Error('Resultado no válido');
  return r;
}
const esc = s => String(s).replace(/[*_~`]/g, m => '\\' + m);
const chunk = (s, n = 3500) => { const o = []; for (let i = 0; i < s.length; i += n) o.push(s.slice(i, i + n)); return o; };
module.exports = { sleep, digits, jidNum, pick, rand, clamp, fmtMs, parseDuration, calc, esc, chunk };
