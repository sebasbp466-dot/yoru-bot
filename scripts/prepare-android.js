#!/usr/bin/env node
'use strict';
/* Copia el bot a android/www/nodejs (lo que el plugin ejecuta dentro de la app) e instala sus dependencias de producción. */
const fs = require('fs'), path = require('path'), cp = require('child_process');
const root = path.join(__dirname, '..'), out = path.join(root, 'android', 'www', 'nodejs');
fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out, { recursive: true });
fs.cpSync(path.join(root, 'src'), path.join(out, 'src'), { recursive: true });
fs.copyFileSync(path.join(root, 'package.json'), path.join(out, 'package.json'));
fs.writeFileSync(path.join(out, 'index.js'), `'use strict';
// Punto de entrada dentro de la app Android. DATADIR lo define el plugin (carpeta privada y persistente de la app).
const path = require('path');
const base = process.env.DATADIR || process.env.HOME || __dirname;
process.env.YORU_DATA = process.env.YORU_DATA || path.join(base, 'yoru');
require('./src/index.js').start();
`);
const pkg = JSON.parse(fs.readFileSync(path.join(out, 'package.json'), 'utf8')); pkg.main = 'index.js'; delete pkg.scripts; pkg.scripts = {}; fs.writeFileSync(path.join(out, 'package.json'), JSON.stringify(pkg, null, 2));
console.log('npm install (producción) en', out);
cp.execSync('npm install --omit=dev --no-audit --no-fund --ignore-scripts', { cwd: out, stdio: 'inherit' });
// quita lo que no hace falta en el móvil
for (const d of ['node_modules/.cache', 'node_modules/@types']) fs.rmSync(path.join(out, d), { recursive: true, force: true });
console.log('listo');
