#!/usr/bin/env node
'use strict';
/* Une menu/src/* en un solo HTML (docs/index.html) y regenera src/core/planned.json desde data.js.
   Úsalo cada vez que cambies el menú:  npm run menu   */
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..'), src = path.join(root, 'menu', 'src');
const rd = f => fs.readFileSync(path.join(src, f), 'utf8');
let html = rd('body.html');
for (const [k, f] of [['/*CSS*/', 'style.css'], ['/*DATA*/', 'data.js'], ['/*SCENES*/', 'scenes.js'], ['/*APP*/', 'app.js']]) html = html.split(k).join(rd(f));
const url = process.env.MENU_URL || '';
fs.mkdirSync(path.join(root, 'docs'), { recursive: true });
fs.writeFileSync(path.join(root, 'docs', 'index.html'), html);
const raw = rd('data.js').match(/const RAW=`([\s\S]*?)`/)[1].trim().split('\n').map(l => { const p = l.split('|'); return { cat: p[0], name: p[1], desc: p[2], ex: '/' + p[3], perm: p[4], alias: p[5] ? p[5].split(',') : [] }; });
fs.writeFileSync(path.join(root, 'src', 'core', 'planned.json'), JSON.stringify(raw));
console.log(`menú → docs/index.html (${(html.length / 1024).toFixed(0)} KB) · ${raw.length} comandos en planned.json`);
