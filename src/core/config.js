'use strict';
const fs = require('fs'), path = require('path');
const DATA = process.env.YORU_DATA || path.join(process.cwd(), 'data');
const FILE = process.env.YORU_CONFIG || path.join(DATA, 'config.json');
const DEFAULTS = {
  botName: 'Yoru', prefixes: ['/'], owners: [], pairingNumber: '',
  menuUrl: '', menuMode: 'button', geminiKeys: [],
  models: { flash: 'gemini-2.5-flash', pro: 'gemini-2.5-pro', lite: 'gemini-2.5-flash-lite' },
  dailyLimit: 40, apiPort: 8787, apiToken: '', apiClaimed: false
};
function load() {
  fs.mkdirSync(DATA, { recursive: true });
  let raw = {};
  for (const f of [FILE, path.join(process.cwd(), 'config.json')]) { try { raw = JSON.parse(fs.readFileSync(f, 'utf8')); break; } catch {} }
  const c = { ...DEFAULTS, ...raw, models: { ...DEFAULTS.models, ...(raw.models || {}) } };
  if (process.env.GEMINI_KEYS) c.geminiKeys = process.env.GEMINI_KEYS.split(',').map(s => s.trim()).filter(Boolean);
  c.geminiKeys = (c.geminiKeys || []).filter(k => k && !/PEGA_AQUI/.test(k));
  c.owners = (c.owners || []).map(o => String(o).replace(/\D/g, '')).filter(Boolean);
  c.prefixes = c.prefixes && c.prefixes.length ? c.prefixes : ['/'];
  if (!c.apiToken || c.apiToken === 'cambia-este-token') c.apiToken = require('crypto').randomBytes(12).toString('hex');
  return c;
}
function save(cfg) { fs.mkdirSync(DATA, { recursive: true }); fs.writeFileSync(FILE, JSON.stringify(cfg, null, 2)); }
const needsSetup = c => !c.geminiKeys.length || !c.owners.length;
module.exports = { DATA, FILE, DEFAULTS, load, save, needsSetup };
