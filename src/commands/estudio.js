'use strict';
const { aiCmd } = require('../core/helpers');
const E = (name, hint, f, extra = {}) => aiCmd({ cat: 'estudio', name, hint, prompt: f, ...extra });
module.exports = [
  E('explicar', 'la fotosíntesis', t => `Explica "${t}" de forma simple, con una analogía y un ejemplo.`),
  E('definir', 'entropía', t => `Define "${t}" en máximo 3 líneas y da un ejemplo de uso.`),
  E('sinonimos', 'rápido', t => `Dame 8 sinónimos de "${t}" y 2 antónimos, con una frase de ejemplo.`),
  E('ensayo', 'la importancia del sueño', t => `Escribe un ensayo corto (3 párrafos: introducción, desarrollo, conclusión) sobre: ${t}`, { max: 1600 }),
  E('esquema', 'la Revolución Francesa', t => `Haz un esquema jerárquico con viñetas sobre: ${t}`),
  E('plan', 'aprender inglés en 3 meses', t => `Crea un plan de estudio semanal realista y motivador para: ${t}`, { max: 1500 }),
  E('citar', 'libro de Cien años de soledad', t => `Da una referencia en formato APA 7 (indica qué datos faltan si no los tengo) para: ${t}`),
  E('quiz', 'historia de Roma', t => `Crea 5 preguntas de opción múltiple (A-D) sobre "${t}". Al final, una sección "Respuestas" con la correcta de cada una.`, { max: 1500 }),
  E('tarjetas', 'verbos irregulares en inglés', t => `Crea 6 tarjetas de estudio tipo "Pregunta → Respuesta" sobre: ${t}`),
  E('practica', 'ecuaciones de primer grado', t => `Propón 4 ejercicios de práctica de dificultad creciente sobre "${t}". No des las soluciones todavía; termina diciendo que pidan */mate* para resolver.`),
  E('mate', '2x + 5 = 17', t => `Resuelve paso a paso y da el resultado final claro: ${t}`, { temp: 0.2 })
];
