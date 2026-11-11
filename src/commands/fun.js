'use strict';
const { pick, rand } = require('../core/util');
const { ai, usage } = require('../core/helpers');
const L = {
  chiste: ['¿Qué hace una abeja en el gimnasio? ¡Zum-ba!', 'Mi wifi y yo tenemos algo en común: nos desconectamos cuando más nos necesitan.', '¿Por qué los programadores confunden Halloween con Navidad? Porque Oct 31 = Dec 25.', '—Doctor, tengo complejo de inferioridad. —Tranquilo, es normal en gente como usted.'],
  piropo: ['Si fueras un comando, serías /favorito.', 'Eres como mi batería al 1%: lo único en lo que pienso.', 'Tu sonrisa tiene más brillo que un shiny.'],
  consejo: ['Bebe agua y estira la espalda ahora mismo.', 'Divide lo grande en tareas de 10 minutos.', 'Duerme: arregla más cosas que un reinicio.', 'Lo que no puedes controlar, déjalo en el buzón de mañana.'],
  fortuna: ['Una oportunidad inesperada tocará tu puerta esta semana.', 'Alguien piensa en ti con cariño hoy.', 'Hoy es buen día para empezar eso que pospones.', 'La paciencia traerá algo dulce.']
};
const viaAI = (name, prompt, extra = {}) => ({ cat: 'fun', name, cd: 8, async run(c) { let t; try { t = (await ai(c, prompt(c), { max: 300, temperature: 1, ...extra })).text; } catch (e) { if (L[name]) t = pick(L[name]); else throw e; } await c.reply(t); } });
const pct = (c, label) => { let h = 0; for (const ch of c.sender + label + new Date().toDateString()) h = (h * 33 + ch.charCodeAt(0)) % 101; return h; };
module.exports = [
  viaAI('chiste', () => 'Cuenta un chiste corto, original y sin groserías.'),
  viaAI('piropo', () => 'Dime un piropo ingenioso, tierno y respetuoso (1-2 líneas).'),
  viaAI('consejo', () => 'Dame un consejo práctico del día en 2 líneas.'),
  { cat: 'fun', name: 'fortuna', async run(c) { await c.reply('🥠 ' + pick(L.fortuna)); } },
  viaAI('roast', c => `Haz un roast MUY suave, amistoso y gracioso (2 líneas, sin insultos reales ni temas sensibles) sobre: ${c.body || 'quien lo pidió'}.`),
  viaAI('apodo', c => `Inventa 3 apodos divertidos estilo anime para: ${c.body || c.user.name || 'esta persona'}.`),
  viaAI('hechizo', c => `Inventa un hechizo de fantasía con nombre épico, efecto y debilidad (4 líneas) para: ${c.body || 'cualquier cosa'}.`),
  { cat: 'fun', name: 'destino', async run(c) { await c.reply(`🔮 Hoy tu energía está al *${pct(c, 'e')}%*, tu suerte al *${pct(c, 's')}%* y tu ánimo al *${pct(c, 'a')}%*.`); } },
  { cat: 'fun', name: 'test', async run(c) { if (!c.body) throw usage('Uso: */test nivel de otaku*'); await c.reply(`📊 *${c.body}*: ${pct(c, c.body)}%`); } }
];
