'use strict';
const fs = require('fs'), path = require('path');
const config = require('./core/config');
const { log, quiet } = require('./core/log');
const DB = require('./core/db');
const Gemini = require('./core/gemini');
const { loadCommands } = require('./core/loader');
const { createHandler } = require('./core/handler');
const { startApi } = require('./core/api');
const Scheduler = require('./core/scheduler');
const { onParticipants } = require('./core/groupEvents');

const app = { cfg: config.load(), startedAt: Date.now(), conn: 'stopped', pairing: null, qr: null, me: '', sock: null, reconnects: 0 };
app.db = new DB(config.DATA); app.log = log;
app.gemini = new Gemini(app.cfg, app.db, log);
app.registry = loadCommands(log);
const H = createHandler(app); app.handler = H;
app.sched = new Scheduler(app.db, async t => { if (app.sock && app.conn === 'open') await app.sock.sendMessage(t.jid, { text: t.text, mentions: t.mentions || [] }); }, log);

app.status = () => ({
  bot: app.cfg.botName, version: require('../package.json').version, conn: app.conn, me: app.me, pairing: app.pairing, qr: app.qr,
  uptime: Date.now() - app.startedAt, paused: app.db.data.settings.paused, maintenance: app.db.data.settings.maintenance, persona: app.db.data.settings.persona,
  needsSetup: config.needsSetup(app.cfg), ai: app.gemini.status(),
  stats: { cmds: app.db.data.stats.cmds, ai: app.db.data.stats.ai, errors: app.db.data.stats.errors, users: Object.keys(app.db.data.users).length, groups: Object.keys(app.db.data.groups).length, ready: app.registry.ready, stubs: app.registry.stubs },
  mem: Math.round(process.memoryUsage().rss / 1048576)
});
app.applyConfig = async patch => {
  const allowed = ['botName', 'prefixes', 'owners', 'pairingNumber', 'menuUrl', 'menuMode', 'geminiKeys', 'dailyLimit'];
  const next = { ...app.cfg };
  for (const k of allowed) if (k in patch) next[k] = patch[k];
  if (typeof next.geminiKeys === 'string') next.geminiKeys = next.geminiKeys.split(/[\s,]+/);
  if (typeof next.owners === 'string') next.owners = next.owners.split(/[\s,]+/);
  if (typeof next.prefixes === 'string') next.prefixes = next.prefixes.split(/\s+/);
  next.geminiKeys = (next.geminiKeys || []).filter(k => k && !k.includes('…'));
  if (!next.geminiKeys.length) next.geminiKeys = app.cfg.geminiKeys; // la app muestra las claves recortadas; no las pises
  next.owners = (next.owners || []).map(o => String(o).replace(/\D/g, '')).filter(Boolean);
  next.pairingNumber = String(next.pairingNumber || '').replace(/\D/g, '');
  Object.assign(app.cfg, next); config.save(app.cfg); log.info('Configuración guardada');
  await app.restart();
};
app.logout = async () => { try { await app.sock?.logout(); } catch {} fs.rmSync(path.join(config.DATA, 'auth'), { recursive: true, force: true }); await app.restart(); };
app.restart = async () => { try { app.sock?.end?.(); } catch {} app.sock = null; app.conn = 'stopped'; await connect(); };

let baileys = null, backoff = 2000;
async function connect() {
  if (!baileys) { try { baileys = require('@whiskeysockets/baileys'); } catch (e) { app.conn = 'nolib'; log.error('Falta @whiskeysockets/baileys (npm install)'); return; } }
  if (!app.cfg.owners.length) { app.conn = 'setup'; log.warn('Falta configurar el owner. Abre la app o edita config.json'); return; }
  const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, Browsers } = baileys;
  const { state, saveCreds } = await useMultiFileAuthState(path.join(config.DATA, 'auth'));
  let version; try { version = (await fetchLatestBaileysVersion()).version; } catch {}
  const sock = makeWASocket({ auth: state, version, logger: quiet, browser: Browsers ? Browsers.ubuntu('Chrome') : ['Yoru', 'Chrome', '1.0'], printQRInTerminal: false, syncFullHistory: false, markOnlineOnConnect: false, generateHighQualityLinkPreview: false });
  app.sock = sock; app.conn = 'connecting';
  sock.ev.on('creds.update', saveCreds);
  if (!state.creds.registered && app.cfg.pairingNumber) {
    setTimeout(async () => { try { const code = await sock.requestPairingCode(app.cfg.pairingNumber); app.pairing = code.match(/.{1,4}/g).join('-'); log.info('Código de vinculación: ' + app.pairing); } catch (e) { log.error('No se pudo pedir el código', e.message); } }, 3000);
  }
  sock.ev.on('connection.update', u => {
    if (u.qr) { app.qr = u.qr; if (!app.cfg.pairingNumber) log.info('QR listo (ábrelo en la app)'); }
    if (u.connection === 'open') { app.conn = 'open'; app.pairing = null; app.qr = null; app.me = (sock.user && sock.user.id || '').split(':')[0].split('@')[0]; backoff = 2000; log.info('Conectado como +' + app.me); }
    if (u.connection === 'close') {
      const code = u.lastDisconnect && u.lastDisconnect.error && u.lastDisconnect.error.output && u.lastDisconnect.error.output.statusCode;
      app.conn = 'closed';
      if (code === DisconnectReason.loggedOut) { log.warn('Sesión cerrada desde el teléfono. Borra data/auth y vuelve a vincular.'); fs.rmSync(path.join(config.DATA, 'auth'), { recursive: true, force: true }); app.conn = 'loggedout'; return; }
      if (app.sock !== sock) return; // reinicio manual
      log.warn('Conexión cerrada (' + code + '), reintento en ' + Math.round(backoff / 1000) + ' s'); setTimeout(() => connect().catch(e => log.error(e.message)), backoff); backoff = Math.min(backoff * 2, 60000);
    }
  });
  sock.ev.on('messages.upsert', async ({ messages, type }) => { if (type !== 'notify') return; for (const m of messages) { try { await H.handle(sock, m); } catch (e) { log.error('mensaje', e.message); } } });
  sock.ev.on('group-participants.update', ev => onParticipants(sock, app.db, ev).catch(e => log.warn('grupo', e.message)));
}
app.sched.send = async t => { if (app.sock && app.conn === 'open') await app.sock.sendMessage(t.jid, { text: t.text, mentions: t.mentions || [] }); else throw new Error('sin conexión'); };

function start() {
  startApi(app); app.sched.start();
  connect().catch(e => log.error('conexión', e.message));
  const bye = () => { app.db.flush(); process.exit(0); };
  process.on('SIGINT', bye); process.on('SIGTERM', bye);
  process.on('unhandledRejection', e => log.error('rechazo', e && e.message || e));
  process.on('uncaughtException', e => log.error('excepción', e.message));
  log.info(`Yoru listo · token API: ${app.cfg.apiToken}`);
}
module.exports = { app, start };
if (require.main === module) start();
