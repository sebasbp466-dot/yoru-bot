'use strict';
const test = require('node:test'), assert = require('node:assert');
const fs = require('fs'), os = require('os'), path = require('path');
process.env.YORU_DATA = fs.mkdtempSync(path.join(os.tmpdir(), 'yoru-'));
const { parse, textOf } = require('../src/core/handler');
const { calc, parseDuration, fmtMs } = require('../src/core/util');
const Gemini = require('../src/core/gemini');
const DB = require('../src/core/db');
const { loadCommands } = require('../src/core/loader');
const { fill } = require('../src/core/groupEvents');
const { log } = require('../src/core/log');

test('parse: prefijo, comando y argumentos', () => {
  assert.deepStrictEqual(parse('/IA hola mundo', ['/']), { prefix: '/', name: 'ia', args: ['hola', 'mundo'], body: 'hola mundo' });
  assert.strictEqual(parse('hola', ['/']), null); assert.strictEqual(parse('/', ['/']), null);
  assert.strictEqual(parse('/menú', ['/']).name, 'menú');
});
test('textOf: mensajes envueltos y pies de foto', () => {
  assert.strictEqual(textOf({ conversation: ' hi ' }), 'hi');
  assert.strictEqual(textOf({ ephemeralMessage: { message: { imageMessage: { caption: '/ping' } } } }), '/ping');
});
test('calc: seguro y correcto', () => {
  assert.strictEqual(calc('(12+8)*3^2'), 180); assert.strictEqual(calc('sqrt(16)+2'), 6);
  for (const bad of ['process.exit()', 'require("fs")', '1+', 'constructor', '2**999999']) assert.throws(() => calc(bad), bad);
});
test('parseDuration y fmtMs', () => { assert.strictEqual(parseDuration('1h 30m'), 5400000); assert.strictEqual(parseDuration('xx'), null); assert.strictEqual(fmtMs(90061000), '1d 1h 1m'); });
test('bienvenida: variables', () => assert.strictEqual(fill('Hola @user a @grupo (@n)', { user: '@5', group: 'G', n: '9' }), 'Hola @5 a G (9)'));
test('loader: comandos reales + los del menú como pendientes', () => {
  const r = loadCommands({ info() {}, error: console.error, warn() {} });
  assert.ok(r.reg.get('ia') && !r.reg.get('ia').stub); assert.ok(r.reg.get('menú') || r.reg.get('menu')); assert.ok(r.reg.get('waifu').stub);
  assert.ok(r.ready >= 80, 'listos: ' + r.ready); assert.ok(r.list.length >= 218);
  const names = r.list.map(c => c.name); assert.strictEqual(new Set(names).size, names.length, 'nombres repetidos');
});
const cfg = () => ({ geminiKeys: ['k1', 'k2'], models: { flash: 'f', pro: 'p', lite: 'l' }, dailyLimit: 2 });
const mkdb = () => new DB(fs.mkdtempSync(path.join(os.tmpdir(), 'db-')));
const resp = (status, body) => ({ status, text: async () => JSON.stringify(body), json: async () => body });
const ok = t => resp(200, { candidates: [{ content: { parts: [{ text: t }] } }] });
test('gemini: elige el modelo y rota claves ante 429', async () => {
  const calls = []; const g = new Gemini(cfg(), mkdb(), log, { fetch: async (u, o) => { calls.push([u, o.headers['x-goog-api-key']]); return calls.length === 1 ? resp(429, {}) : ok('hola'); } });
  const r = await g.ask({ text: 'x' }); assert.strictEqual(r.text, 'hola'); assert.strictEqual(r.model, 'f'); assert.notStrictEqual(calls[0][1], calls[1][1]);
});
test('gemini: si el modelo elegido cae, usa respaldo y lo avisa', async () => {
  const db = mkdb(); db.data.settings.model = 'pro';
  const g = new Gemini(cfg(), db, log, { fetch: async u => u.includes('/p:') ? resp(503, {}) : ok('ok') });
  const r = await g.ask({ text: 'x' }); assert.strictEqual(r.alias, 'flash'); assert.strictEqual(r.fellBack, true);
});
test('gemini: sin claves y fallo total', async () => {
  await assert.rejects(new Gemini({ ...cfg(), geminiKeys: [] }, mkdb(), log).ask({ text: 'x' }), e => e.code === 'NOKEY');
  await assert.rejects(new Gemini(cfg(), mkdb(), log, { fetch: async () => resp(503, {}) }).ask({ text: 'x' }), e => e.code === 'FAIL');
});
test('gemini: cupo diario', () => {
  const g = new Gemini(cfg(), mkdb(), log), u = { aiDay: '', aiN: 0 };
  assert.ok(g.quota(u, false, false).ok); assert.ok(g.quota(u, false, false).ok); assert.ok(!g.quota(u, false, false).ok); assert.ok(g.quota(u, true, false).ok); assert.ok(g.quota(u, false, true).ok);
});
test('db: guarda y recarga', () => { const d = mkdb(); d.user('1').coins = 7; d.flush(); assert.strictEqual(new DB(path.dirname(d.file)).data.users['1'].coins, 7); });

test('handler: de mensaje a respuesta, con permisos y cooldown', async () => {
  const { createHandler } = require('../src/core/handler');
  const db = mkdb(), reg = loadCommands({ info() {}, error() {}, warn() {} });
  const app = { cfg: { prefixes: ['/'], owners: ['111'], botName: 'T', menuUrl: '' }, db, log, gemini: new Gemini(cfg(), db, log), registry: reg, recent: {} };
  const out = []; const sock = { user: { id: '999:1@s.whatsapp.net' }, sendMessage: async (j, c) => { out.push(c.text || c); return { key: { id: 'x' + out.length } }; }, sendPresenceUpdate: async () => {} };
  const H = createHandler(app); let n = 0;
  const m = (from, text) => ({ key: { remoteJid: from + '@s.whatsapp.net', id: 'm' + (++n), fromMe: false }, message: { conversation: text }, pushName: 'T' });
  await H.handle(sock, m('222', '/moneda')); assert.match(out.pop(), /Cara|Cruz/);
  await H.handle(sock, m('222', '/moneda')); assert.match(out.pop(), /Espera/);           // cooldown
  await H.handle(sock, m('222', '/vetar 584120000333')); assert.match(out.pop(), /owner/);         // permiso
  await H.handle(sock, m('111', '/vetar 584120000333')); assert.match(out.pop(), /vetad/);
  await H.handle(sock, m('584120000333', '/dado')); assert.strictEqual(out.length, 0);              // vetado: silencio
  await H.handle(sock, m('222', '/calc 2+2')); assert.match(out.pop(), /= \*4\*/);
  await H.handle(sock, m('222', '/waifu')); assert.match(out.pop(), /construcción/);
  await H.handle(sock, m('222', '/ia hola')); assert.match(out.pop(), /Sin conexión con Gemini/);
});
