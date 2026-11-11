const PREFIX='/';
const CATS=[
 {id:'ia',name:'IA',ico:'✦',sub:'Gemini, personalidades y creación'},
 {id:'estudio',name:'Estudio',ico:'✎',sub:'Aprende, practica y organiza'},
 {id:'grupo',name:'Grupo',ico:'☷',sub:'Ajustes y vida del grupo'},
 {id:'mod',name:'Moderación',ico:'⛨',sub:'Orden, avisos y roles'},
 {id:'dl',name:'Descargas',ico:'⇩',sub:'Video, audio e imágenes'},
 {id:'music',name:'Audio',ico:'♪',sub:'Música, efectos y voz'},
 {id:'juegos',name:'Juegos',ico:'◆',sub:'Partidas rápidas en el chat'},
 {id:'rpg',name:'Aventura',ico:'⚔',sub:'Explora, lucha y crece'},
 {id:'gacha',name:'Cartas',ico:'❖',sub:'Invoca y colecciona personajes'},
 {id:'eco',name:'Economía',ico:'¤',sub:'Monedas, tienda y banco'},
 {id:'anime',name:'Anime',ico:'❀',sub:'Imágenes, datos y reacciones'},
 {id:'stick',name:'Edición',ico:'▣',sub:'Stickers y efectos de imagen'},
 {id:'tools',name:'Utilidades',ico:'⚙',sub:'Herramientas del día a día'},
 {id:'prod',name:'Productividad',ico:'☑',sub:'Tareas, notas y recordatorios'},
 {id:'info',name:'Mundo',ico:'◎',sub:'Clima, noticias y datos'},
 {id:'fun',name:'Diversión',ico:'☺',sub:'Chistes, suerte y bromas'},
 {id:'bot',name:'Bot',ico:'◈',sub:'Estado, ajustes y ayuda'},
 {id:'owner',name:'Owner',ico:'♛',sub:'Control total del bot'}
];
const RAW=`ia|ia|Conversa con la IA|ia cuéntame algo curioso|T|ask
ia|imagina|Crea una imagen desde una descripción|imagina castillo flotante al amanecer|P|img
ia|modelo|Elige el modelo de IA del chat|modelo flash|A
ia|modelos|Muestra los modelos y su estado|modelos|T
ia|alma|Cambia la personalidad de la IA|alma sensei|A|persona
ia|vision|Analiza la imagen a la que respondes|vision|T
ia|resumir|Resume los últimos mensajes|resumir 60|T|tldr
ia|reescribir|Reescribe un texto con otro tono|reescribir formal hola amigo|T
ia|memoria|Ver o borrar lo que la IA recuerda|memoria borrar|T
ia|debate|La IA defiende una postura contra ti|debate gatos vs perros|T
ia|rol|Historia de rol narrada por la IA|rol viaje a un reino perdido|T
ia|codigo|Genera y explica código|codigo función que ordene una lista|T
ia|tono|Detecta el tono de un mensaje|tono estoy muy cansado|T
estudio|explicar|Explica un tema como si tuvieras 10 años|explicar fotosíntesis|T|eli10
estudio|quiz|Preguntas de práctica sobre un tema|quiz historia de Venezuela|T
estudio|tarjetas|Crea tarjetas de estudio|tarjetas verbos en inglés|T
estudio|mate|Resuelve un problema paso a paso|mate 3x+5=20|T
estudio|definir|Definición y ejemplos de una palabra|definir efímero|T
estudio|sinonimos|Sinónimos y antónimos|sinonimos rápido|T
estudio|ensayo|Esquema de ensayo con ideas clave|ensayo cambio climático|T
estudio|esquema|Convierte un texto en esquema|esquema texto largo|T
estudio|practica|Practica un idioma con la IA|practica inglés básico|T
estudio|plan|Plan de estudio por días|plan examen en 5 días|T
estudio|citar|Cita una fuente en formato APA|citar https://…|T
grupo|escudo|Antienlaces y antispam en un solo ajuste|escudo on|A
grupo|portero|Verifica a los nuevos miembros|portero on|A
grupo|bienvenida|Define el mensaje de bienvenida|bienvenida Hola @user|A
grupo|despedida|Define el mensaje de despedida|despedida Adiós @user|A
grupo|noche|Cierra el grupo en un horario|noche 23:00 07:00|A
grupo|reglas|Muestra las reglas del grupo|reglas|T
grupo|setreglas|Guarda las reglas del grupo|setreglas 1. Respeto|A
grupo|eventos|Agenda un evento del grupo|eventos sábado 8pm torneo|T
grupo|cumples|Lista los próximos cumpleaños|cumples|T
grupo|tablero|Mensaje fijo con avisos del grupo|tablero Reunión viernes|A
grupo|niveles|Activa el sistema de niveles|niveles on|A
grupo|logros|Muestra los logros del grupo|logros|T
mod|expulsar|Expulsa a un miembro|expulsar @usuario|A|kick
mod|ascender|Da rol de admin|ascender @usuario|A
mod|degradar|Quita el rol de admin|degradar @usuario|A
mod|llamar|Menciona a todos con un aviso|llamar reunión a las 8|A|todos
mod|susurro|Avisa a todos sin mostrar la lista|susurro aviso importante|A
mod|abrir|Permite que todos escriban|abrir|A
mod|cerrar|Solo los admins pueden escribir|cerrar|A
mod|enlace|Muestra el enlace de invitación|enlace|A
mod|renovar|Cambia el enlace de invitación|renovar|A
mod|borrar|Borra el mensaje al que respondes|borrar|A
mod|avisar|Da una advertencia a un miembro|avisar @usuario spam|A
mod|perdonar|Quita una advertencia|perdonar @usuario|A
mod|avisos|Lista las advertencias del grupo|avisos|A
mod|silenciar|Silencia a un miembro|silenciar @usuario 1h|A
mod|hablar|Quita el silencio|hablar @usuario|A
mod|purgar|Borra los últimos mensajes|purgar 20|A
dl|ytaudio|Descarga el audio de YouTube|ytaudio https://youtu.be/…|T
dl|ytvideo|Descarga el video de YouTube|ytvideo https://youtu.be/…|T
dl|tiktok|Descarga un video de TikTok|tiktok https://vm.tiktok.com/…|T|tt
dl|instagram|Descarga posts y reels|instagram https://instagram.com/p/…|T|ig
dl|facebook|Descarga videos de Facebook|facebook https://fb.watch/…|T|fb
dl|x|Descarga videos de X|x https://x.com/…|T
dl|reddit|Descarga videos de Reddit|reddit https://reddit.com/…|T
dl|pinterest|Busca imágenes en Pinterest|pinterest paisaje nocturno|T|pin
dl|archivo|Descarga archivos de Mediafire|archivo https://mediafire.com/…|T
dl|captura|Captura de una página web|captura https://ejemplo.com|T
dl|buscaimg|Busca imágenes en la web|buscaimg aurora boreal|T
music|play|Busca y envía una canción|play lofi hip hop|T
music|letra|Muestra la letra de una canción|letra nombre de la canción|T|lyrics
music|shazam|Reconoce la canción de un audio|shazam|T
music|radio|Sintoniza una radio en vivo|radio lofi|T
music|graves|Sube los graves de un audio|graves|T|bass
music|nightcore|Acelera y agudiza un audio|nightcore|T
music|lento|Ralentiza un audio|lento|T
music|cortar|Recorta un audio|cortar 0:10 0:40|T
music|robot|Voz de robot para un audio|robot|T
music|voz|Convierte texto en nota de voz|voz es hola a todos|T|tts
music|escuchados|Canciones más pedidas del grupo|escuchados|T
juegos|ppt|Piedra, papel o tijera|ppt piedra|T
juegos|trivia|Pregunta de cultura general|trivia|T
juegos|ahorcado|Juega al ahorcado en el chat|ahorcado|T
juegos|palabra|Adivina la palabra del día|palabra|T
juegos|gato|Tres en raya contra otro miembro|gato @usuario|T
juegos|ruleta|Gira la ruleta de apuestas|ruleta 100 rojo|T
juegos|dado|Lanza un dado|dado 20|T
juegos|moneda|Cara o cruz|moneda|T
juegos|ship|Compatibilidad entre dos miembros|ship @a @b|T
juegos|top|Ranking aleatorio del grupo|top los más graciosos|T
juegos|verdad|Pregunta de verdad|verdad|T
juegos|reto|Reto para cumplir|reto|T
juegos|parejas|Memoria de parejas|parejas|T
juegos|mafia|Partida de mafia en el grupo|mafia|T
juegos|bingo|Bingo con premios|bingo|T
rpg|aventura|Empieza una aventura corta|aventura|T
rpg|mazmorra|Explora una mazmorra por turnos|mazmorra|T
rpg|cazar|Sal de caza|cazar|T
rpg|pescar|Lanza la caña|pescar|T
rpg|minar|Busca minerales|minar|T
rpg|cultivar|Siembra y cosecha|cultivar|T
rpg|forjar|Crea un arma o armadura|forjar espada|T
rpg|duelo|Reta a otro jugador|duelo @usuario|T
rpg|gremio|Crea o únete a un gremio|gremio crear Alba|T
rpg|jefe|Evento de jefe del grupo|jefe|T
rpg|descansar|Recupera vida y energía|descansar|T
rpg|mascota|Adopta y cuida una mascota|mascota|T
gacha|invocar|Invoca un personaje|invocar|T
gacha|coleccion|Mira tus cartas|coleccion|T
gacha|carta|Ficha de una carta|carta Aiko|T
gacha|intercambiar|Intercambia cartas con alguien|intercambiar @usuario|T
gacha|vender|Vende una carta por monedas|vender Aiko|T
gacha|favorita|Marca tu carta favorita|favorita Aiko|T
gacha|banner|Personajes destacados de la semana|banner|T
gacha|garantia|Tiradas hasta la carta rara|garantia|T
gacha|fusion|Fusiona cartas repetidas|fusion Aiko|T
gacha|album|Álbum con tu progreso|album|T
eco|saldo|Muestra tu saldo|saldo|T|bal
eco|diario|Recompensa diaria|diario|T|daily
eco|trabajar|Trabaja para ganar monedas|trabajar|T
eco|enviar|Envía monedas a otro miembro|enviar @usuario 200|T
eco|banco|Guarda monedas en el banco|banco depositar 500|T
eco|robar|Intenta robar monedas|robar @usuario|T
eco|tienda|Mira los objetos a la venta|tienda|T
eco|comprar|Compra un objeto|comprar poción|T
eco|mochila|Muestra tus objetos|mochila|T
eco|riqueza|Los más ricos del grupo|riqueza|T
eco|apostar|Apuesta monedas|apostar 100|T
eco|prestamo|Pide un préstamo con interés|prestamo 300|T
anime|waifu|Imagen aleatoria de waifu|waifu|T
anime|neko|Imagen aleatoria de neko|neko|T
anime|anime|Busca información de un anime|anime Frieren|T
anime|manga|Busca información de un manga|manga Berserk|T
anime|personaje|Busca un personaje|personaje Rem|T
anime|cita|Cita de anime al azar|cita|T
anime|abrazo|Abraza a alguien|abrazo @usuario|T
anime|caricia|Acaricia a alguien|caricia @usuario|T
anime|bofetada|Cachetada de broma|bofetada @usuario|T
anime|baile|Baile animado|baile|T
anime|sonrojo|Reacción de vergüenza|sonrojo|T
anime|temporada|Estrenos del anime de temporada|temporada|T
stick|sticker|Crea un sticker de una imagen o video|sticker|T|s
stick|aimagen|Convierte un sticker en imagen|aimagen|T|toimg
stick|textosticker|Sticker de texto animado|textosticker hola|T
stick|mezcla|Mezcla dos emojis|mezcla 😀+😎|T
stick|sinfondo|Quita el fondo de una imagen|sinfondo|T
stick|meme|Crea un meme con texto arriba y abajo|meme arriba / abajo|T
stick|caricatura|Estilo caricatura para tu foto|caricatura|P
stick|pixelar|Pixela una imagen|pixelar|T
stick|desenfocar|Desenfoca una imagen|desenfocar|T
stick|espejo|Refleja una imagen|espejo|T
stick|marco|Agrega un marco|marco neon|T
stick|firma|Cambia el nombre del paquete|firma Yoru|T
tools|qr|Genera un código QR|qr https://ejemplo.com|T
tools|acortar|Acorta un enlace|acortar https://…|T
tools|ocr|Lee el texto de una imagen|ocr|T
tools|calc|Calculadora|calc 25*4+10|T
tools|color|Muestra un color y su código|color #ff8fb8|T
tools|convertir|Convierte unidades y monedas|convertir 10 km mi|T
tools|clave|Genera una contraseña segura|clave 16|T
tools|base64|Codifica o decodifica en base64|base64 hola|T
tools|contar|Cuenta palabras y caracteres|contar texto|T
tools|encuesta|Crea una encuesta rápida|encuesta ¿Pizza? / Sí / No|T
tools|sorteo|Sortea entre los miembros|sorteo 1 ganador|A
tools|equipos|Divide al grupo en equipos|equipos 3|T
tools|turnos|Orden aleatorio de participación|turnos|T
prod|recordar|Te avisa a la hora indicada|recordar 20:30 estudiar|T
prod|tarea|Agrega una tarea|tarea comprar pan|T
prod|tareas|Lista tus tareas|tareas|T
prod|hecho|Marca una tarea como hecha|hecho 2|T
prod|nota|Guarda una nota|nota idea para el proyecto|T
prod|notas|Lista tus notas|notas|T
prod|agenda|Tus eventos de la semana|agenda|T
prod|pomodoro|Temporizador de enfoque|pomodoro 25|T
prod|habito|Sigue un hábito diario|habito leer|T
prod|cuenta|Cuenta regresiva a una fecha|cuenta 25/12|T
prod|alarma|Alarma en el chat|alarma 07:00|T
info|clima|Clima de una ciudad|clima Caracas|T
info|hora|Hora en otra ciudad|hora Tokio|T
info|wiki|Busca en Wikipedia|wiki Nikola Tesla|T
info|noticias|Titulares del momento|noticias|T
info|dolar|Precio del dólar|dolar|T
info|cripto|Precio de una criptomoneda|cripto btc|T
info|sismo|Últimos sismos|sismo|T
info|luna|Fase de la luna|luna|T
info|horoscopo|Horóscopo del día|horoscopo leo|T
info|feriados|Próximos feriados|feriados|T
info|pais|Ficha de un país|pais Japón|T
info|perfil|Tu perfil y nivel|perfil|T
info|quien|Información de un miembro|quien @usuario|T
fun|chiste|Un chiste al azar|chiste|T
fun|piropo|Un piropo elegante|piropo|T
fun|consejo|Un consejo del día|consejo|T
fun|bola8|Responde tus dudas|bola8 ¿Aprobaré?|T
fun|fortuna|Galleta de la fortuna|fortuna|T
fun|roast|Broma amistosa a un amigo|roast @usuario|T
fun|test|Test de personalidad|test|T
fun|apodo|Te da un apodo épico|apodo|T
fun|destino|Tu destino de hoy|destino|T
fun|hechizo|Un hechizo inventado|hechizo|T
fun|memazo|Un meme al azar|memazo|T
bot|menu|Abre este menú|menu|T|menú
bot|ping|Mide la latencia del bot|ping|T
bot|estado|Uptime, memoria y modelo en uso|estado|T|status
bot|prefijo|Cambia el prefijo de los comandos|prefijo !|O
bot|idioma|Cambia el idioma del bot|idioma es|A
bot|ayuda|Cómo usar un comando|ayuda play|T
bot|reportar|Envía un reporte al owner|reportar el comando falla|T
bot|sugerir|Sugiere una función nueva|sugerir comando de clima|T
bot|invitar|Enlace para añadir el bot|invitar|T
bot|version|Versión y novedades|version|T
bot|privacidad|Qué datos guarda el bot|privacidad|T
bot|tema|Elige el tema del menú|tema vacío|T
owner|difundir|Envía un aviso a todos los chats|difundir mantenimiento a las 10|O
owner|vetar|Bloquea a un usuario del bot|vetar @usuario|O
owner|indultar|Desbloquea a un usuario|indultar @usuario|O
owner|premium|Da o quita acceso premium|premium dar @usuario 30d|O
owner|entrar|Une el bot a un grupo|entrar https://chat.whatsapp.com/…|O
owner|salir|Saca el bot de un grupo|salir|O
owner|respaldo|Copia de la base de datos|respaldo|O
owner|reiniciar|Reinicia el bot|reiniciar|O
owner|bio|Cambia la bio del bot|bio Yoru en línea|O
owner|mantenimiento|Activa el modo mantenimiento|mantenimiento on|O
owner|registros|Últimas líneas del registro|registros 30|O`;
const PERM={T:'Todos',A:'Admin',O:'Owner',P:'Premium'};
const CMDS=RAW.trim().split('\n').map(l=>{const p=l.split('|');return{cat:p[0],name:p[1],desc:p[2],ex:PREFIX+p[3],perm:PERM[p[4]],alias:p[5]||'—'}});
