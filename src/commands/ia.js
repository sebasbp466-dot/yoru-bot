'use strict';
const { ai, aiCmd, usage, PERSONAS } = require('../core/helpers');
const MODELS = { auto: 'Automático (flash → lite → pro)', flash: 'Flash · rápido y equilibrado', pro: 'Pro · razona mejor, más lento', lite: 'Lite · el más ligero' };
module.exports = [
  { cat: 'ia', name: 'ia', alias: ['ask', 'yoru'], cd: 5, desc: 'Conversa con la IA', async run(c) {
    const q = [c.quotedText && `[Mensaje citado: ${c.quotedText.slice(0, 600)}]`, c.body].filter(Boolean).join('\n'); if (!q) throw usage('✦ Escríbeme algo: */ia cuéntame algo curioso*');
    const chat = c.db.chat(c.jid + ':' + c.sender), hist = chat.hist.slice(-10);
    const r = await ai(c, q, { history: hist });
    chat.hist.push({ role: 'user', text: q.slice(0, 800) }, { role: 'model', text: r.text.slice(0, 1200) }); chat.hist = chat.hist.slice(-20); c.db.save();
    await c.reply(r.text + (r.fellBack ? '\n\n_(usé otro modelo porque el elegido no respondió)_' : '')); } },
  { cat: 'ia', name: 'modelo', perm: 'A', desc: 'Elige el modelo de IA del chat', async run(c) {
    const m = (c.args[0] || '').toLowerCase(); if (!MODELS[m]) throw usage('Opciones: *auto*, *flash*, *pro*, *lite*\nEjemplo: */modelo flash*');
    c.db.data.settings.model = m; c.db.save(); await c.reply('✅ Modelo: ' + MODELS[m]); } },
  { cat: 'ia', name: 'modelos', async run(c) { const s = c.gemini.status();
    await c.reply('🧠 *Modelos*\n' + Object.entries(MODELS).map(([k, v]) => `${s.pref === k ? '➤' : '•'} ${k} — ${v}`).join('\n') + '\n\nIDs: ' + s.models.map(m => `${m.alias}=${m.id}${m.paused ? ' (en pausa)' : ''}`).join(', ') + `\nClaves activas: ${s.keys - s.keysPaused}/${s.keys}`); } },
  { cat: 'ia', name: 'alma', alias: ['persona'], perm: 'A', async run(c) { const p = (c.args[0] || '').toLowerCase();
    if (!PERSONAS[p]) return c.reply('🎭 *Personalidades*\n' + Object.entries(PERSONAS).map(([k, v]) => `• ${k} — ${v.desc}`).join('\n') + '\n\nUso: */alma sensei*');
    c.db.data.settings.persona = p; c.db.save(); await c.reply('✅ Personalidad: ' + PERSONAS[p].name); } },
  { cat: 'ia', name: 'memoria', async run(c) { const ch = c.db.chat(c.jid + ':' + c.sender);
    if ((c.args[0] || '') === 'borrar') { ch.hist = []; c.db.save(); return c.reply('🧹 Listo, olvidé nuestra conversación.'); }
    await c.reply(`🧠 Recuerdo ${Math.floor(ch.hist.length / 2)} intercambios contigo. Usa */memoria borrar* para limpiar.`); } },
  { cat: 'ia', name: 'resumir', alias: ['tldr'], cd: 20, async run(c) { const n = Math.min(80, Math.max(10, parseInt(c.args[0]) || 40)); const r = (c.app.recent[c.jid] || []).slice(-n);
    if (r.length < 5) throw usage('Todavía no tengo suficientes mensajes de este chat para resumir.');
    const out = await ai(c, 'Resume esta conversación de WhatsApp en 4-6 viñetas, destacando acuerdos y pendientes:\n' + r.join('\n'), { max: 700 }); await c.reply('📝 *Resumen*\n' + out.text); } },
  { cat: 'ia', name: 'vision', cd: 10, async run(c) { const m = await c.media(); if (!m) throw usage('Responde a una imagen con */vision* (y, si quieres, una pregunta).');
    const r = await ai(c, c.body || 'Describe esta imagen con detalle y di qué ves de interesante.', { image: { mime: m.mime, data: m.buf.toString('base64') } }); await c.reply(r.text); } },
  aiCmd({ cat: 'ia', name: 'reescribir', hint: 'formal hola amigo', desc: 'Reescribe un texto con otro tono', prompt: t => `Reescribe el texto siguiente. Si empieza con un tono (formal, casual, divertido, corto, poético…) úsalo; si no, mejora la redacción. Devuelve solo el texto:\n${t}` }),
  aiCmd({ cat: 'ia', name: 'tono', hint: 'amable no puedo ir hoy', prompt: t => `Convierte este mensaje al tono indicado en la primera palabra y devuelve solo el mensaje resultante:\n${t}` }),
  aiCmd({ cat: 'ia', name: 'debate', hint: 'el café es mejor que el té', prompt: t => `Presenta ambos lados del tema con 3 argumentos fuertes cada uno y una conclusión neutral: ${t}` }),
  aiCmd({ cat: 'ia', name: 'codigo', alias: ['code'], hint: 'función en js que invierte un texto', max: 1800, prompt: t => `Responde con código correcto y breve, con una explicación de 2 líneas. Usa bloques \`\`\` : ${t}` }),
  aiCmd({ cat: 'ia', name: 'rol', hint: 'eres un samurái, saluda', max: 900, prompt: t => `Juega este rol de forma creativa y breve, sin salirte del personaje: ${t}` })
];
