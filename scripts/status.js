#!/usr/bin/env node
'use strict';
/* Estado rápido desde la terminal:  node scripts/status.js [puerto] [token] */
const cfg = require('../src/core/config').load();
const port = process.argv[2] || cfg.apiPort, tok = process.argv[3] || cfg.apiToken;
fetch(`http://127.0.0.1:${port}/status`, { headers: { authorization: 'Bearer ' + tok } }).then(r => r.json()).then(j => console.log(JSON.stringify(j, null, 2))).catch(e => console.error('El bot no responde:', e.message));
