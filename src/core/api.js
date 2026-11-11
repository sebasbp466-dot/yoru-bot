'use strict';
const http = require('http');
/** API local para la app de monitoreo. Solo escucha en 127.0.0.1 y exige token. */
function startApi(app) {
  const { cfg, log } = app;
  const send = (res, code, obj) => { res.writeHead(code, { 'content-type': 'application/json', 'access-control-allow-origin': '*', 'access-control-allow-headers': 'authorization,content-type', 'access-control-allow-methods': 'GET,POST,OPTIONS' }); res.end(JSON.stringify(obj)); };
  const server = http.createServer((req, res) => {
    if (req.method === 'OPTIONS') return send(res, 204, {});
    const auth = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    const url = new URL(req.url, 'http://x');
    if (url.pathname === '/ping') return send(res, 200, { ok: true, name: cfg.botName, claimed: !!cfg.apiClaimed });
    // primera configuración: sin owners todavía se permite con el token guardado en el archivo de config (lo muestra la app)
    const isClaim = url.pathname === '/claim' && req.method === 'POST';
    if (!isClaim && auth !== app.cfg.apiToken) return send(res, 401, { error: 'token' });
    let body = ''; req.on('data', d => { body += d; if (body.length > 2e5) req.destroy(); });
    req.on('end', async () => {
      try {
        const j = body ? JSON.parse(body) : {};
        if (isClaim) { // la primera app que llega fija su token; después ya nadie más puede
          if (cfg.apiClaimed) return send(res, 403, { error: 'ya reclamado' });
          if (!j.token || String(j.token).length < 16) return send(res, 400, { error: 'token corto' });
          cfg.apiToken = String(j.token); cfg.apiClaimed = true; require('./config').save(cfg); log.info('App vinculada'); return send(res, 200, { ok: true }); }
        if (url.pathname === '/status') return send(res, 200, app.status());
        if (url.pathname === '/logs') return send(res, 200, { lines: log.tail(+url.searchParams.get('n') || 80) });
        if (url.pathname === '/commands') return send(res, 200, { ready: app.registry.ready, stubs: app.registry.stubs, top: Object.entries(app.db.data.stats.byCmd).sort((a, b) => b[1] - a[1]).slice(0, 8) });
        if (url.pathname === '/model' && req.method === 'POST') { if (!['auto', 'flash', 'pro', 'lite'].includes(j.model)) return send(res, 400, { error: 'modelo' }); app.db.data.settings.model = j.model; app.db.save(); return send(res, 200, { ok: true }); }
        if (url.pathname === '/pause' && req.method === 'POST') { app.db.data.settings.paused = !!j.paused; app.db.save(); return send(res, 200, { ok: true }); }
        if (url.pathname === '/maintenance' && req.method === 'POST') { app.db.data.settings.maintenance = !!j.on; app.db.save(); return send(res, 200, { ok: true }); }
        if (url.pathname === '/config' && req.method === 'GET') return send(res, 200, { ...cfg, geminiKeys: cfg.geminiKeys.map(k => k.slice(0, 6) + '…' + k.slice(-3)) });
        if (url.pathname === '/config' && req.method === 'POST') { await app.applyConfig(j); return send(res, 200, { ok: true }); }
        if (url.pathname === '/restart' && req.method === 'POST') { send(res, 200, { ok: true }); setTimeout(() => app.restart(), 300); return; }
        if (url.pathname === '/logout' && req.method === 'POST') { await app.logout(); return send(res, 200, { ok: true }); }
        send(res, 404, { error: 'no existe' });
      } catch (e) { send(res, 500, { error: e.message }); }
    });
  });
  server.on('error', e => log.error('API', e.message));
  server.listen(cfg.apiPort, '127.0.0.1', () => log.info('API local en 127.0.0.1:' + cfg.apiPort));
  return server;
}
module.exports = { startApi };
