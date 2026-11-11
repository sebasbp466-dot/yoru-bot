'use strict';
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
const norm=s=>s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
const pad=n=>String(n).padStart(2,'0');
const LS={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const rr=s=>()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ───────── estado ───────── */
const THEMES=[
 {id:'sakura',name:'Sakura',hue:338,dim:10,css:'linear-gradient(#0b1030,#4a2f6e 60%,#d0709a)'},
 {id:'hole',name:'Gargantúa',hue:28,dim:8,css:'radial-gradient(circle at 50% 45%,#000 0 16%,#ffb25c 22%,#7a2d0a 40%,#02020a 70%)'},
 {id:'aurora',name:'Aurora',hue:160,dim:10,css:'linear-gradient(160deg,#04101f,#0f6a5a 45%,#6a3fd6 75%,#04101f)'},
 {id:'neon',name:'Neón',hue:300,dim:10,css:'linear-gradient(#12062e,#5a1a78 55%,#ff3d9a 56%,#1a0538 57%)'},
 {id:'rain',name:'Lluvia',hue:200,dim:12,css:'linear-gradient(#070615,#2b1a4d 70%,#0b3a5a)'},
 {id:'sunset',name:'Atardecer',hue:18,dim:12,css:'linear-gradient(#2a1160,#c84b82 50%,#ffb070 80%,#ffe3a0)'},
 {id:'summer',name:'Verano',hue:200,dim:30,css:'linear-gradient(#2a73d8,#8cc8f6 60%,#58b552 61%,#1f6a3a)'},
 {id:'forest',name:'Bosque',hue:165,dim:10,css:'linear-gradient(#020c10,#06302e 55%,#0b4a3c)'},
 {id:'stars',name:'Vía láctea',hue:265,dim:8,css:'linear-gradient(135deg,#050818,#2a2475 45%,#8a6ad0 52%,#1b1650 60%,#050818)'},
 {id:'sea',name:'Mar',hue:210,dim:10,css:'linear-gradient(#030a22,#27497c 50%,#0e284d 51%,#040a1c)'},
 {id:'min',name:'Mínimo',hue:215,dim:10,css:'linear-gradient(#0a0e1f,#141c3a)'},
 {id:'custom',name:'Mi imagen',hue:338,dim:30,css:'repeating-conic-gradient(#2a3158 0 25%,#1b2142 0 50%) 0 0/16px 16px'}
];
const DEF={scene:'sakura',hue:338,dim:10,blur:14,glass:50,radius:18,speed:1,density:1,par:1,idle:1,gyro:true,anim:!reduce,quality:'auto',cols:2,compact:false,dots:true,viz:'bars',font:1,haptic:true,cpet:true};
let S=Object.assign({},DEF,LS.get('yoru3-set',{}));
let PR=Object.assign({name:'Invitado',xp:0,coins:250,streak:0,last:0,ach:{}},LS.get('yoru3-prof',{}));PR.cnt=Object.assign({cmd:0,ia:0,tool:0,theme:0},PR.cnt||{});
const GDEF={sw:{escudo:true,spam:true,fakes:false,toxic:false,borrados:false,admins:false,welcome:true,bye:true,mention:true,autosticker:false,niveles:true,juegos:true,nocturno:false},wel:'¡Bienvenid@ @user a @grupo! Eres el miembro n.º @n. Lee las reglas con /reglas.',rules:'1. Respeto ante todo\n2. Nada de spam\n3. Diviértete',from:'23:00',to:'07:00'};
let G=Object.assign({},GDEF,LS.get('yoru3-grp',{}));G.sw=Object.assign({},GDEF.sw,G.sw||{});
let favs=new Set(LS.get('yoru3-fav',[])),recent=LS.get('yoru3-rec',[]);
let IA=Object.assign({model:'flash',pers:'amable',temp:.7,mem:true,long:false,sys:'Eres Yoru, un bot de WhatsApp amable y útil. Responde en español y de forma breve.',used:38},LS.get('yoru3-ia',{}));
let chat=LS.get('yoru3-chat',[]);
const saveS=()=>LS.set('yoru3-set',S),saveP=()=>LS.set('yoru3-prof',PR),saveG=()=>LS.set('yoru3-grp',G),saveI=()=>LS.set('yoru3-ia',IA);
const saveF=()=>LS.set('yoru3-fav',[...favs]),saveR=()=>LS.set('yoru3-rec',recent);
let tt;function toast(m){const e=$('toast');e.textContent=m;e.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>e.classList.remove('on'),1700)}
const buzz=n=>{if(S.haptic&&navigator.vibrate)try{navigator.vibrate(n)}catch(e){}};
const catOf=id=>CATS.find(c=>c.id===id);
const lvl=xp=>Math.floor(Math.sqrt(xp/40))+1,lvBase=l=>40*(l-1)*(l-1);

/* ───────── logros y xp ───────── */
const ACH=[
 {id:'first',t:'Primer paso',d:'Abre tu primer comando',ok:()=>PR.cnt.cmd>=1,ico:'✦'},
 {id:'explorer',t:'Explorador',d:'Abre 15 comandos',ok:()=>PR.cnt.cmd>=15,ico:'◎'},
 {id:'fav3',t:'Coleccionista',d:'Guarda 3 favoritos',ok:()=>favs.size>=3,ico:'★'},
 {id:'chatter',t:'Conversador',d:'Envía 5 mensajes a la IA',ok:()=>PR.cnt.ia>=5,ico:'☺'},
 {id:'theme',t:'Estético',d:'Cambia de tema 3 veces',ok:()=>PR.cnt.theme>=3,ico:'❀'},
 {id:'streak',t:'Constancia',d:'Racha de 3 días',ok:()=>PR.streak>=3,ico:'☀'},
 {id:'rich',t:'Ahorrador',d:'Junta 600 monedas',ok:()=>PR.coins>=600,ico:'¤'},
 {id:'lv5',t:'Veterano',d:'Llega al nivel 5',ok:()=>lvl(PR.xp)>=5,ico:'♛'},
 {id:'tool',t:'Manitas',d:'Usa 5 herramientas',ok:()=>PR.cnt.tool>=5,ico:'⚙'},
 {id:'art',t:'Artista',d:'Sube tu propio fondo',ok:()=>!!PR.custom,ico:'▣'},
 {id:'owl',t:'Búho nocturno',d:'Entra entre las 0 y las 5 h',ok:()=>PR.owl,ico:'☾'},
 {id:'all',t:'Perfeccionista',d:'Desbloquea todos los demás',ok:()=>ACH.slice(0,-1).every(a=>PR.ach[a.id]),ico:'❖'}
];
function checkAch(){let got=false;for(const a of ACH)if(!PR.ach[a.id]&&a.ok()){PR.ach[a.id]=1;got=true;toast('Logro: '+a.t);buzz([30,40,30])}if(got){saveP();if(tab==='me')renderMe()}}
function addXp(n,c=0){const l0=lvl(PR.xp);PR.xp+=n;PR.coins+=c;if(lvl(PR.xp)>l0){toast('¡Nivel '+lvl(PR.xp)+'!');buzz([40,60,40])}saveP();checkAch();if(tab==='me')renderMe()}
const bump=k=>{PR.cnt[k]++;addXp(k==='cmd'?3:2)};

/* ───────── ajustes ───────── */
const FMT={hue:v=>v+'°',dim:v=>v+'%',speed:v=>(+v).toFixed(1)+'×',density:v=>Math.round(v*100)+'%',par:v=>v===0?'apagado':Math.round(v*100)+'%',idle:v=>v===0?'apagado':Math.round(v*100)+'%',blur:v=>v+' px',glass:v=>v+'%',radius:v=>v+' px',font:v=>Math.round(v*100)+'%'};
function applyS(){
  const r=document.documentElement.style;
  r.setProperty('--h',S.hue);r.setProperty('--blur',S.blur+'px');r.setProperty('--ga',(S.glass/100).toFixed(2));r.setProperty('--rad',S.radius+'px');
  r.setProperty('--fs',S.font);r.setProperty('--cols',S.cols);r.setProperty('--dim',(S.dim/100).toFixed(2));
  const b=document.body.classList;b.toggle('compact',S.compact);b.toggle('nodots',!S.dots);b.toggle('noanim',!S.anim);b.toggle('noblur',S.blur===0);b.toggle('noviz',S.viz==='off');
  document.querySelectorAll('#set [data-k]').forEach(el=>{const k=el.dataset.k;
    if(el.type==='range'){el.value=S[k];const o=document.getElementById('o-'+k);if(o)o.textContent=FMT[k](S[k])}
    else if(el.type==='checkbox')el.checked=!!S[k];
    else if(el.dataset.v!==undefined)el.setAttribute('aria-pressed',String(S[k])===el.dataset.v)});
  document.querySelectorAll('.tile').forEach(t=>t.setAttribute('aria-pressed',t.dataset.id===S.scene));
  document.querySelectorAll('.sw').forEach(t=>t.setAttribute('aria-pressed',+t.dataset.h===+S.hue));
  BG.set({hue:S.hue,density:S.density,par:S.par,idle:S.idle,speed:S.speed,anim:S.anim,quality:S.quality,cpet:S.cpet,scene:S.scene});
  drawViz.on=S.viz!=='off'&&S.anim;
}
/* imagen propia en IndexedDB */
const IDB={open(){return new Promise((ok,no)=>{try{const q=indexedDB.open('yoru3',1);q.onupgradeneeded=()=>q.result.createObjectStore('f');q.onsuccess=()=>ok(q.result);q.onerror=()=>no(q.error)}catch(e){no(e)}})},
 async put(k,v){try{const d=await this.open();return await new Promise(r=>{const t=d.transaction('f','readwrite');t.objectStore('f').put(v,k);t.oncomplete=()=>r(1);t.onerror=()=>r(0)})}catch(e){return 0}},
 async get(k){try{const d=await this.open();return await new Promise(r=>{const q=d.transaction('f').objectStore('f').get(k);q.onsuccess=()=>r(q.result);q.onerror=()=>r(null)})}catch(e){return null}}};
async function useBlob(b){try{let bm;try{bm=await createImageBitmap(b,{resizeWidth:1400,resizeQuality:'medium'})}catch(e){bm=await createImageBitmap(b)}BG.setCustom(bm);return true}catch(e){return false}}

/* ───────── vistas ───────── */
const TABS=[['home','Inicio','M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z'],['cmds','Comandos','M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z'],['ia','IA','M12 3l2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2z'],['group','Grupo','M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 20c0-3 2.7-5 6-5s6 2 6 5M17 11a2.5 2.5 0 1 0 0-5M17.5 15c2.2.3 3.5 2 3.5 5'],['extras','Extras','M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z'],['me','Perfil','M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4 3.6-7 8-7s8 3 8 7']];
const HASH={home:'inicio',cmds:'comandos',ia:'ia',group:'grupo',extras:'extras',me:'perfil'};
let tab='home',built={};
const spark=(seed)=>{const r=rr(seed);let v=.5,d='';for(let i=0;i<12;i++){v=Math.max(.12,Math.min(.95,v+(r()-.42)*.32));d+=(i?'L':'M')+(i*9)+' '+(27-v*23).toFixed(1)}return `<svg viewBox="0 0 99 28" preserveAspectRatio="none"><path d="${d}L99 28L0 28Z" fill="currentColor" opacity=".16"/><path d="${d}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/></svg>`};
const greet=()=>{const h=new Date().getHours();return h<6?'Buenas madrugadas':h<12?'Buenos días':h<19?'Buenas tardes':'Buenas noches'};
const dayIdx=()=>Math.floor(Date.now()/864e5);

function buildHome(){
  const qa=[['sticker','▣','Sticker'],['play','♪','Música'],['ia','✦','Preguntar'],['clima','☁','Clima'],['aventura','⚔','Aventura'],['invocar','❖','Invocar'],['recordar','☑','Recordar'],['waifu','❀','Waifu']];
  const cod=CMDS[(dayIdx()*7)%CMDS.length];
  const tips=['Mantén pulsado un comando en el chat para responderlo y usarlo más rápido.','Guarda tus comandos favoritos con la estrella para tenerlos siempre a mano.','Cambia el fondo en el engranaje: hay 12 escenas y puedes subir la tuya.','Usa /resumir después de una charla larga para ponerte al día.','Sube de nivel usando el bot: cada comando suma XP.'];
  return `<section class="card bf hero"><span class="tag">MENÚ PREMIUM</span><div><p class="muted" id="greet"></p><h2>Yoru</h2></div><p class="lead">Tu bot de WhatsApp con IA, juegos, cartas y herramientas. Elige una pestaña o toca un acceso rápido.</p>
   <div class="row"><div class="viz"><canvas id="viz" aria-hidden="true"></canvas><span>actividad</span></div>
   <div class="fetch"><div><b>cmds</b>${CMDS.length}</div><div><b>modelo</b><span id="f-model"></span></div><div><b>uptime</b>3h 12m</div><div><b>nivel</b><span id="f-lvl"></span></div><span class="ex">datos de ejemplo</span></div></div></section>
  <h3 class="sec-h">Hoy <small>ejemplo</small></h3>
  <div class="stats">${[['Mensajes','1 284','+12%',1],['Comandos','342','+8%',2],['Usuarios','2 160','+3%',3],['Grupos','37','+1',4]].map(s=>`<div class="stat glass"><span>${s[0]}</span><b>${s[1]}</b><em>${s[2]}</em>${spark(s[3]*17)}</div>`).join('')}</div>
  <h3 class="sec-h">Accesos rápidos</h3>
  <div class="qa">${qa.map(q=>`<button class="glass" type="button" data-a="cmd" data-n="${q[0]}"><i>${q[1]}</i><span>${q[2]}</span></button>`).join('')}</div>
  <div class="card bf cod"><div class="eyebrow">Comando del día</div><button class="cmd cod-b" type="button" data-a="cmd" data-n="${cod.name}"><span class="nm">${cod.ex.split(' ')[0]}</span></button><p>${esc(cod.desc)}.</p><p class="muted tip">${tips[dayIdx()%tips.length]}</p></div>
  <div id="home-rec"></div>
  <h3 class="sec-h">Novedades</h3>
  <div class="news">${[['v0.9','Fondos de anime','12 escenas animadas, fondo propio y calidad automática para que fluya en cualquier celular.'],['v0.8','Panel de grupo','Escudo, bienvenida con vista previa, horario nocturno y miembros.'],['v0.7','Cartas y aventura','Invoca personajes, forja armas y explora mazmorras con tu gremio.']].map(n=>`<article class="card bf"><span class="ver">${n[0]}</span><h4>${n[1]}</h4><p>${n[2]}</p></article>`).join('')}</div>
  <h3 class="sec-h">Servicios <small>ejemplo</small></h3>
  <div class="svc">${[['WhatsApp','Conectado','ok'],['Gemini','Operativo','ok'],['Base de datos','Operativa','ok'],['Descargas','2 en cola','warn']].map(s=>`<div class="glass"><i class="${s[2]}"></i><div><b>${s[0]}</b><span>${s[1]}</span></div></div>`).join('')}</div>`}
function updHome(){
  const g=$('greet');if(g)g.textContent=greet()+', '+PR.name;const fm=$('f-model');if(fm)fm.textContent=MODELS.find(m=>m.id===IA.model).short;const fl=$('f-lvl');if(fl)fl.textContent=lvl(PR.xp);
  const hr=$('home-rec');if(hr)hr.innerHTML=recent.length?`<h3 class="sec-h">Usados hace poco</h3><div class="scroller">${recent.map(n=>`<button class="chip glass sm" type="button" data-a="cmd" data-n="${n}">${PREFIX}${n}</button>`).join('')}</div>`:''}

/* comandos */
let cat='ia',query='',pf='all',sortAZ=false,showAll=false;
function buildCmds(){return `<label class="glass bf search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input id="q" type="search" placeholder="Buscar entre ${CMDS.length} comandos…" autocomplete="off" aria-label="Buscar comando"><button id="clr" type="button" data-a="clr" aria-label="Borrar búsqueda" hidden>×</button></label>
  <nav class="scroller" id="chips" aria-label="Categorías"></nav>
  <div class="scroller" id="perms" aria-label="Filtros"></div>
  <div class="cathead" id="cathead"></div>
  <div class="gridbox glass bf"><div class="grid" id="grid"></div></div><p class="foot" id="foot"></p>`}
function listCmds(){let l;
  if(query){const q=norm(query);l=CMDS.filter(c=>norm(c.name+' '+c.desc+' '+c.alias+' '+catOf(c.cat).name).includes(q))}
  else if(cat==='fav')l=CMDS.filter(c=>favs.has(c.name));else if(cat==='rec')l=recent.map(n=>CMDS.find(c=>c.name===n)).filter(Boolean);else l=CMDS.filter(c=>c.cat===cat);
  if(pf!=='all')l=l.filter(c=>c.perm===pf);if(sortAZ)l=[...l].sort((a,b)=>a.name.localeCompare(b.name));return l}
function renderCmds(){
  const all=[{id:'fav',name:'★ Favoritos',n:favs.size},{id:'rec',name:'↺ Recientes',n:recent.length},...CATS.map(c=>({id:c.id,name:c.name,n:CMDS.filter(x=>x.cat===c.id).length}))];
  $('chips').innerHTML=all.map(c=>`<button class="chip glass" type="button" data-a="cat" data-id="${c.id}" aria-pressed="${!query&&cat===c.id}">${c.name}<em>${c.n}</em></button>`).join('');
  $('perms').innerHTML=[['all','Todo'],['Todos','Para todos'],['Admin','Admin'],['Premium','Premium'],['Owner','Owner']].map(([v,n])=>`<button class="chip sm glass" type="button" data-a="pf" data-p="${v}" aria-pressed="${pf===v}">${n}</button>`).join('')+`<button class="chip sm glass" type="button" data-a="sort" aria-pressed="${sortAZ}">A–Z</button>`;
  const items=listCmds();let h;
  if(query)h={ico:'⌕',name:'Resultados',sub:`Coincidencias con “${esc(query)}”`};else if(cat==='fav')h={ico:'★',name:'Favoritos',sub:'Tus comandos guardados'};else if(cat==='rec')h={ico:'↺',name:'Recientes',sub:'Lo último que abriste'};else{const c=catOf(cat);h={ico:c.ico,name:c.name,sub:c.sub}}
  $('cathead').innerHTML=`<div class="ico glass" aria-hidden="true">${h.ico}</div><div><h3>${h.name}</h3><p>${h.sub}</p></div><span class="n">${items.length}</span>`;
  const lim=showAll?999:60,shown=items.slice(0,lim);
  $('grid').innerHTML=shown.length?shown.map((c,i)=>`<button class="cmd ${c.perm==='Admin'?'adm':c.perm==='Owner'?'own':c.perm==='Premium'?'pre':c.cat==='ia'?'ai':''}" style="--i:${Math.min(i,12)}" type="button" data-a="cmd" data-n="${c.name}"><i class="dot"></i><span class="nm">${PREFIX}${c.name}</span>${favs.has(c.name)?'<span class="fav">★</span>':''}</button>`).join('')+(items.length>lim?`<button class="cmd more" type="button" data-a="more">Ver ${items.length-lim} más</button>`:''):`<div class="empty">${cat==='fav'&&!query?'Aún no tienes favoritos. Abre un comando y toca “Favorito”.':cat==='rec'&&!query?'Todavía no abriste ningún comando.':'No hay comandos que coincidan.'}</div>`;
  $('foot').textContent=`${CMDS.length} comandos · ${CATS.length} categorías · prefijo “${PREFIX}”`}

/* IA */
const MODELS=[{id:'flash',name:'Gemini Flash',short:'gemini-flash',d:'Rápido y equilibrado. El mejor para el día a día.'},{id:'pro',name:'Gemini Pro',short:'gemini-pro',d:'Más preciso en tareas largas y razonamiento.'},{id:'lite',name:'Flash-Lite',short:'flash-lite',d:'Ahorra cuota. Respuestas cortas al instante.'},{id:'auto',name:'Automático',short:'auto',d:'Elige el modelo según la pregunta y la cuota.'}];
const PERS=[{id:'amable',n:'Amable',i:'☺',d:'Cálida y cercana',f:t=>t},{id:'tsun',n:'Tsundere',i:'✧',d:'Orgullosa pero buena',f:t=>'B-baka... '+t+' ¡N-no es que me importe!'},{id:'kuu',n:'Kuudere',i:'❄',d:'Fría y directa',f:t=>t.replace(/[¡!]/g,'').toLowerCase()+'.'},{id:'sensei',n:'Sensei',i:'✎',d:'Enseña paso a paso',f:t=>'Escucha con atención: '+t+' Practica y vuelve a preguntarme.'},{id:'pirata',n:'Pirata',i:'☠',d:'Habla como corsario',f:t=>'¡Arrr! '+t+', grumete.'},{id:'formal',n:'Formal',i:'◆',d:'Profesional y claro',f:t=>'Estimado usuario: '+t}];
const KB=[[/hola|buenas|\bhey\b|\bola\b/i,'¡Hola! Soy Yoru. ¿En qué te ayudo hoy?'],[/qui[eé]n eres|c[oó]mo te llamas/i,'Soy Yoru, el bot de este grupo. Converso, resumo, estudio contigo y mucho más.'],[/chiste/i,'¿Qué hace una abeja en el gimnasio? ¡Zum-ba!'],[/gracias/i,'¡De nada! Aquí estoy para lo que necesites.'],[/anime|recomi/i,'Si buscas calma, prueba Frieren; si quieres acción, Jujutsu Kaisen. ¿Qué género prefieres?'],[/ayuda|comando|men[uú]/i,'Escribe /menu o abre la pestaña Comandos. También puedes decirme qué quieres hacer.'],[/c[oó]digo|program/i,'Claro. Dime el lenguaje y qué quieres lograr, y te escribo un ejemplo con explicación.'],[/resum/i,'Responde a un mensaje largo con /resumir y te lo dejo en puntos clave.'],[/clima|tiempo/i,'Usa /clima seguido de tu ciudad, por ejemplo /clima Caracas.']];
function buildIA(){return `<section class="card bf"><h3 class="ch">Modelo</h3><div class="models" id="models"></div><div class="quota"><span>Uso del día <small>ejemplo</small></span><b id="qn"></b></div><div class="bar"><i id="qb"></i></div></section>
  <section class="card bf"><h3 class="ch">Personalidad</h3><div class="scroller pers" id="pers"></div></section>
  <section class="card bf chat"><div class="chat-h"><b>Chat con Yoru</b><span class="badge-demo">Vista de prueba</span></div><div class="msgs" id="msgs" aria-live="polite"></div><div class="scroller" id="sugs"></div>
   <form class="composer" id="cform" autocomplete="off"><input id="cin" placeholder="Escríbele a la IA…" aria-label="Mensaje"><button class="btn main sm" type="submit">Enviar</button></form></section>
  <section class="card bf"><h3 class="ch">Ajustes de la IA</h3>
   <div class="ctl"><label for="i-temp">Creatividad</label><output id="o-temp"></output><input id="i-temp" type="range" min="0" max="1" step="0.05" data-i="temp"></div>
   <div class="ctl tg"><label for="i-mem">Recordar la conversación</label><span class="sw-t"><input id="i-mem" type="checkbox" data-i="mem"><span></span></span></div>
   <div class="ctl tg"><label for="i-long">Respuestas largas</label><span class="sw-t"><input id="i-long" type="checkbox" data-i="long"><span></span></span></div>
   <label class="lab" for="i-sys">Instrucciones del sistema</label><textarea id="i-sys" class="inp" rows="3" data-i="sys"></textarea>
   <button class="btn" type="button" data-a="clrchat">Borrar conversación</button></section>`}
function renderIA(){
  $('models').innerHTML=MODELS.map(m=>`<button class="mdl" type="button" data-a="model" data-id="${m.id}" aria-pressed="${IA.model===m.id}"><b>${m.name}</b><span>${m.d}</span></button>`).join('');
  $('pers').innerHTML=PERS.map(p=>`<button class="pc glass" type="button" data-a="pers" data-id="${p.id}" aria-pressed="${IA.pers===p.id}"><i>${p.i}</i><b>${p.n}</b><span>${p.d}</span></button>`).join('');
  $('qn').textContent=IA.used+' / 250';$('qb').style.width=Math.min(100,IA.used/2.5)+'%';
  $('i-temp').value=IA.temp;$('o-temp').textContent=IA.temp.toFixed(2);$('i-mem').checked=IA.mem;$('i-long').checked=IA.long;$('i-sys').value=IA.sys;
  $('sugs').innerHTML=['¿Quién eres?','Cuéntame un chiste','Recomiéndame un anime','¿Cómo uso el menú?'].map(s=>`<button class="chip sm glass" type="button" data-a="sug">${s}</button>`).join('');
  renderMsgs()}
function renderMsgs(){const m=$('msgs');if(!chat.length)chat=[{r:'b',t:'¡Hola! Soy Yoru. Esta es una vista de prueba: aquí se conectará Gemini. Escríbeme algo.'}];
  m.innerHTML=chat.map(x=>`<div class="msg ${x.r}">${esc(x.t)}</div>`).join('');m.scrollTop=m.scrollHeight}
function botReply(t){const p=PERS.find(x=>x.id===IA.pers);let base=null;for(const k of KB)if(k[0].test(t)){base=k[1];break}
  if(!base)base=`Entendido. Sobre “${t.slice(0,60)}”: cuando conectemos Gemini te daré una respuesta real. Por ahora es una vista de prueba.`;
  if(IA.long)base+=' Si quieres más detalle, dime qué parte te interesa y la desarrollo con ejemplos.';return p.f(base)}
function sendChat(t){t=t.trim();if(!t)return;chat.push({r:'u',t});renderMsgs();
  const m=$('msgs'),d=document.createElement('div');d.className='msg b typing';d.innerHTML='<i></i><i></i><i></i>';m.appendChild(d);m.scrollTop=m.scrollHeight;
  setTimeout(()=>{d.remove();chat.push({r:'b',t:botReply(t)});chat=chat.slice(-40);LS.set('yoru3-chat',chat);renderMsgs();IA.used=Math.min(250,IA.used+1);saveI();$('qn').textContent=IA.used+' / 250';$('qb').style.width=Math.min(100,IA.used/2.5)+'%';bump('ia');buzz(15)},650+Math.random()*700)}

/* grupo */
const TGS=[['Seguridad',[['escudo','Escudo de enlaces','Bloquea enlaces de personas que no son admins'],['spam','Antispam','Frena mensajes repetidos o en ráfaga'],['fakes','Anti números falsos','Bloquea cuentas sospechosas al entrar'],['toxic','Filtro de toxicidad','La IA detecta insultos y avisa a los admins'],['borrados','Guardar mensajes borrados','Reenvía a los admins lo que se elimina'],['admins','Solo admins usan el bot','El bot ignora a los demás miembros']]],
 ['Automatizaciones',[['welcome','Bienvenida','Saluda a quien entra'],['bye','Despedida','Se despide de quien sale'],['mention','Responder al mencionar','La IA responde cuando le escriben @Yoru'],['autosticker','Sticker automático','Convierte imágenes en stickers'],['niveles','Niveles y XP','Los miembros suben de nivel conversando'],['juegos','Juegos activos','Permite juegos y cartas en el grupo'],['nocturno','Cerrar de noche','Cierra el grupo en el horario elegido']]]];
const MEM=[['Aiko','Admin',1280],['Mateo','Miembro',940],['Sofía','Admin',860],['Leo','Miembro',420],['Valen','Miembro',300],['Kira','Miembro',120]];
function buildGroup(){return `<section class="card bf"><div class="gh"><div class="av" style="--g:1">C</div><div><h3>Club Anime</h3><p class="muted">37 miembros · 4 admins · <span class="okc">Yoru activo</span></p></div></div></section>
 ${TGS.map(s=>`<section class="card bf"><h3 class="ch">${s[0]}</h3>${s[1].map(t=>`<label class="trow"><div><b>${t[1]}</b><span>${t[2]}</span></div><span class="sw-t"><input type="checkbox" data-g="${t[0]}"><span></span></span></label>`).join('')}${s[0]==='Automatizaciones'?`<div class="times"><label>Cierra <input class="inp" type="time" data-gt="from"></label><label>Abre <input class="inp" type="time" data-gt="to"></label></div>`:''}</section>`).join('')}
 <section class="card bf"><h3 class="ch">Mensaje de bienvenida</h3><textarea id="g-wel" class="inp" rows="3" data-gw="wel"></textarea><div class="vars">${['@user','@grupo','@n'].map(v=>`<button class="chip sm glass" type="button" data-a="var" data-v="${v}">${v}</button>`).join('')}</div>
  <div class="eyebrow">Vista previa</div><div class="wa"><div class="bub" id="g-prev"></div></div></section>
 <section class="card bf"><h3 class="ch">Reglas</h3><textarea id="g-rules" class="inp" rows="4" data-gw="rules"></textarea></section>
 <section class="card bf"><h3 class="ch">Miembros destacados <small>ejemplo</small></h3>${MEM.map((m,i)=>`<div class="mem"><div class="av sm" style="--g:${i+2}">${m[0][0]}</div><div><b>${m[0]}</b><span>${m[1]} · ${m[2]} XP</span></div><div class="mact"><button class="chip sm glass" type="button" data-a="mact" data-t="Silenciado ${m[0]}">Silenciar</button><button class="chip sm glass" type="button" data-a="mact" data-t="${m[0]} ahora es admin">Ascender</button></div></div>`).join('')}</section>`}
function renderGroup(){document.querySelectorAll('[data-g]').forEach(i=>{i.checked=!!G.sw[i.dataset.g]});document.querySelectorAll('[data-gt]').forEach(i=>{i.value=G[i.dataset.gt]});$('g-wel').value=G.wel;$('g-rules').value=G.rules;prevWel()}
function prevWel(){$('g-prev').textContent=G.wel.replace(/@user/g,'@Aiko').replace(/@grupo/g,'Club Anime').replace(/@n/g,'38')||'…'}

/* extras */
const TOOLS=[['pomo','Pomodoro'],['calc','Calculadora'],['rand','Azar'],['pwd','Contraseña'],['note','Notas'],['ttt','Tres en raya'],['mem','Memoria'],['conv','Conversor']];
let tool='pomo',pom={m:25,left:1500,run:false,iv:0},calc={e:''},ttt={b:Array(9).fill(''),w:0,l:0,d:0,over:false},memo={c:[],open:[],lock:false,mv:0,done:0};
const buildExtras=()=>`<div class="scroller" id="tnav"></div><section class="card bf" id="tool"></section>`;
function renderTools(){$('tnav').innerHTML=TOOLS.map(t=>`<button class="chip glass" type="button" data-a="tool" data-id="${t[0]}" aria-pressed="${tool===t[0]}">${t[1]}</button>`).join('');stopPom();
  const T=$('tool');
  if(tool==='pomo'){T.innerHTML=pomHTML()}
  else if(tool==='calc'){const k=['C','(',')','÷','7','8','9','×','4','5','6','−','1','2','3','+','0','.','⌫','='];T.innerHTML=`<div class="cdisp" id="cd">${esc(calc.e)||'0'}</div><div class="ckeys">${k.map(x=>`<button type="button" class="${'÷×−+='.includes(x)?'op':''}" data-a="ck" data-k="${x}">${x}</button>`).join('')}</div>`}
  else if(tool==='rand')T.innerHTML=`<h3 class="ch">Azar</h3><div class="btns3"><button class="btn" type="button" data-a="rnd" data-w="d6">Dado d6</button><button class="btn" type="button" data-a="rnd" data-w="d20">Dado d20</button><button class="btn" type="button" data-a="rnd" data-w="coin">Moneda</button></div><div class="big" id="rout">?</div><label class="lab" for="rlist">Elegir entre opciones (una por línea)</label><textarea id="rlist" class="inp" rows="3">Pizza\nSushi\nTacos</textarea><button class="btn main" type="button" data-a="rnd" data-w="pick">Elegir una</button>`;
  else if(tool==='pwd')T.innerHTML=`<h3 class="ch">Generador de contraseñas</h3><div class="pwd" id="pout">—</div><div class="ctl"><label for="plen">Longitud</label><output id="o-plen">16</output><input id="plen" type="range" min="8" max="40" value="16"></div><div class="ctl tg"><label for="psym">Incluir símbolos</label><span class="sw-t"><input id="psym" type="checkbox" checked><span></span></span></div><div class="btns3 two"><button class="btn main" type="button" data-a="pgen">Generar</button><button class="btn" type="button" data-a="pcopy">Copiar</button></div>`;
  else if(tool==='note')T.innerHTML=`<h3 class="ch">Notas rápidas</h3><textarea id="nt" class="inp" rows="9" placeholder="Escribe aquí. Se guarda solo en este dispositivo."></textarea>`,$('nt').value=LS.get('yoru3-note','');
  else if(tool==='ttt')T.innerHTML=tttHTML();
  else if(tool==='mem'){memInit();T.innerHTML=memHTML()}
  else if(tool==='conv')T.innerHTML=convHTML()}
function stopPom(){clearInterval(pom.iv);pom.run=false}
function pomHTML(){const C=2*Math.PI*54,p=1-pom.left/(pom.m*60);return `<div class="ring"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="54" class="r0"/><circle id="pring" cx="60" cy="60" r="54" class="r1" stroke-dasharray="${C}" stroke-dashoffset="${C*(1-p)}" transform="rotate(-90 60 60)"/></svg><b id="ptime">${pad(Math.floor(pom.left/60))}:${pad(pom.left%60)}</b></div>
 <div class="seg c">${[25,5,15].map(m=>`<button type="button" data-a="pmode" data-m="${m}" aria-pressed="${pom.m===m}">${m===25?'Enfoque':m===5?'Pausa':'Descanso'}</button>`).join('')}</div>
 <div class="btns3 two"><button class="btn main" type="button" data-a="pgo" id="pgo">${pom.run?'Pausar':'Iniciar'}</button><button class="btn" type="button" data-a="preset">Reiniciar</button></div>`}
function pomTick(){pom.left--;if(pom.left<=0){stopPom();pom.left=pom.m*60;toast('¡Sesión terminada!');buzz([80,60,80]);addXp(pom.m===25?20:5);bump('tool');if(tool==='pomo')$('tool').innerHTML=pomHTML();return}
  const C=2*Math.PI*54,t=$('ptime');if(!t)return stopPom();t.textContent=pad(Math.floor(pom.left/60))+':'+pad(pom.left%60);$('pring').setAttribute('stroke-dashoffset',C*(pom.left/(pom.m*60)))}
function calcEval(){try{const e=calc.e.replace(/÷/g,'/').replace(/×/g,'*').replace(/−/g,'-');if(!/^[0-9+\-*/().% ]+$/.test(e))return;const v=Function('"use strict";return ('+e+')')();if(!isFinite(v))throw 0;calc.e=String(Math.round(v*1e10)/1e10);bump('tool')}catch(x){calc.e='';toast('Operación no válida')}$('cd').textContent=calc.e||'0'}
const LINES=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
const winner=b=>{for(const l of LINES)if(b[l[0]]&&b[l[0]]===b[l[1]]&&b[l[1]]===b[l[2]])return b[l[0]];return b.every(x=>x)?'D':null};
function minimax(b,pl){const w=winner(b);if(w==='O')return 1;if(w==='X')return -1;if(w==='D')return 0;let best=pl==='O'?-2:2;for(let i=0;i<9;i++)if(!b[i]){b[i]=pl;const v=minimax(b,pl==='O'?'X':'O');b[i]='';best=pl==='O'?Math.max(best,v):Math.min(best,v)}return best}
function botMove(){let bi=-1,bv=-2;for(let i=0;i<9;i++)if(!ttt.b[i]){ttt.b[i]='O';const v=minimax(ttt.b,'X');ttt.b[i]='';if(v>bv||(v===bv&&Math.random()<.3)){bv=v;bi=i}}if(bi>=0)ttt.b[bi]='O'}
function tttHTML(){const w=winner(ttt.b);return `<h3 class="ch">Tres en raya vs Yoru</h3><div class="score"><span>Tú ${ttt.w}</span><span>Empates ${ttt.d}</span><span>Yoru ${ttt.l}</span></div><div class="board">${ttt.b.map((c,i)=>`<button type="button" data-a="tc" data-i="${i}" ${c||w?'disabled':''} class="${c}">${c==='X'?'✕':c==='O'?'○':''}</button>`).join('')}</div><p class="muted c">${w==='X'?'¡Ganaste!':w==='O'?'Ganó Yoru':w==='D'?'Empate':'Tu turno (✕)'}</p><button class="btn" type="button" data-a="treset">Nueva partida</button>`}
const GL=['✦','◆','●','▲','★','♥','♣','♪'];
function memInit(){const a=GL.slice(0,6);memo.c=[...a,...a].map((g,i)=>({g,id:i,f:0,m:0}));for(let i=memo.c.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[memo.c[i],memo.c[j]]=[memo.c[j],memo.c[i]]}memo.open=[];memo.lock=false;memo.mv=0;memo.done=0}
const memHTML=()=>`<h3 class="ch">Memoria <small>${memo.mv} movimientos</small></h3><div class="mgrid">${memo.c.map((c,i)=>`<button type="button" data-a="mc" data-i="${i}" class="${c.f||c.m?'on':''}" ${c.m?'disabled':''}>${c.f||c.m?c.g:''}</button>`).join('')}</div><button class="btn" type="button" data-a="mreset">Barajar de nuevo</button>`;
const UN={temp:{u:['°C','°F','K'],f:(v,a,b)=>{const c=a===0?v:a===1?(v-32)*5/9:v-273.15;return b===0?c:b===1?c*9/5+32:c+273.15}},long:{u:['m','km','mi','ft','in','cm'],k:[1,1000,1609.344,.3048,.0254,.01]},peso:{u:['kg','g','lb','oz'],k:[1,.001,.45359237,.0283495]}};
let cv={t:'temp',a:0,b:1,v:1};
function convHTML(){const U=UN[cv.t];return `<h3 class="ch">Conversor</h3><div class="seg c">${Object.keys(UN).map(k=>`<button type="button" data-a="ctype" data-t="${k}" aria-pressed="${cv.t===k}">${k==='temp'?'Temperatura':k==='long'?'Longitud':'Peso'}</button>`).join('')}</div><div class="convr"><input class="inp" id="cvv" type="number" value="${cv.v}" step="any" aria-label="Valor"><select class="inp" id="cva" aria-label="De">${U.u.map((x,i)=>`<option value="${i}" ${i===cv.a?'selected':''}>${x}</option>`).join('')}</select><span class="arrow">→</span><select class="inp" id="cvb" aria-label="A">${U.u.map((x,i)=>`<option value="${i}" ${i===cv.b?'selected':''}>${x}</option>`).join('')}</select></div><div class="big" id="cvo"></div>`}
function convCalc(){const U=UN[cv.t];let r=U.f?U.f(cv.v,cv.a,cv.b):cv.v*U.k[cv.a]/U.k[cv.b];$('cvo').textContent=(Math.round(r*1e6)/1e6).toLocaleString('es')+' '+U.u[cv.b]}

/* perfil */
const INV=[['Poción','x3','♥'],['Espada de hierro','x1','⚔'],['Llave antigua','x1','✧'],['Gema azul','x7','◆'],['Pergamino','x2','✎'],['Huevo de mascota','x1','●']];
const RANK=[['Aiko',1280],['Mateo',940],['Sofía',860],['Leo',420],['Valen',300]];
const buildMe=()=>`<section class="card bf prof" id="prof"></section><section class="card bf"><h3 class="ch">Logros <small id="achn"></small></h3><div class="badges" id="badges"></div></section>
 <section class="card bf"><h3 class="ch">Ranking del grupo <small>ejemplo</small></h3><div id="rank"></div></section>
 <section class="card bf"><h3 class="ch">Mochila <small>ejemplo</small></h3><div class="inv">${INV.map(i=>`<div class="glass"><i>${i[2]}</i><b>${i[0]}</b><span>${i[1]}</span></div>`).join('')}</div></section>`;
function renderMe(){const l=lvl(PR.xp),a=lvBase(l),b=lvBase(l+1),p=Math.round((PR.xp-a)/(b-a)*100),ready=Date.now()-PR.last>=20*36e5;
  $('prof').innerHTML=`<div class="ph"><div class="av lg" style="--g:0"><b>${esc((PR.name[0]||'?').toUpperCase())}</b></div><div class="pn"><input id="pname" class="inp pn-i" value="${esc(PR.name)}" maxlength="18" aria-label="Tu nombre"><span class="muted">Nivel ${l} · ${PR.xp} XP</span></div></div>
   <div class="xp"><i style="width:${p}%"></i></div><div class="xpl"><span>${PR.xp-a} / ${b-a} XP</span><span>Nivel ${l+1}</span></div>
   <div class="pst"><div><b>${PR.coins}</b><span>Monedas</span></div><div><b>${PR.streak}</b><span>Racha (días)</span></div><div><b>${Object.keys(PR.ach).length}/${ACH.length}</b><span>Logros</span></div></div>
   <button class="btn main" type="button" data-a="daily" ${ready?'':'disabled'}>${ready?'Reclamar recompensa diaria':'Vuelve más tarde'}</button>`;
  $('achn').textContent=Object.keys(PR.ach).length+'/'+ACH.length;
  $('badges').innerHTML=ACH.map(a=>`<div class="bd ${PR.ach[a.id]?'on':''}"><i>${a.ico}</i><b>${a.t}</b><span>${a.d}</span></div>`).join('');
  const all=[...RANK,[PR.name,PR.xp]].sort((x,y)=>y[1]-x[1]).slice(0,6),mx=all[0][1]||1;
  $('rank').innerHTML=all.map((r,i)=>`<div class="rk ${r[0]===PR.name&&r[1]===PR.xp?'me':''}"><em>${i+1}</em><b>${esc(r[0])}</b><div class="bar"><i style="width:${Math.max(3,r[1]/mx*100)}%"></i></div><span>${r[1]}</span></div>`).join('')}
function confetti(){const f=document.createDocumentFragment();for(let i=0;i<22;i++){const e=document.createElement('i');e.className='cf';e.style.cssText=`left:${10+Math.random()*80}%;--dx:${(Math.random()-.5)*160}px;--r:${Math.random()*720}deg;background:hsl(${S.hue+Math.random()*80-20} 100% ${65+Math.random()*20}%);animation-delay:${Math.random()*.2}s`;f.appendChild(e)}document.body.appendChild(f);setTimeout(()=>document.querySelectorAll('.cf').forEach(e=>e.remove()),1800)}

/* ajustes (hoja) */
function buildSettings(){
  $('set-c').innerHTML=`<div class="grab"></div><header class="sh"><div><h4 style="font-family:var(--font);color:var(--fg)">Personalizar</h4><small>Se guarda en este dispositivo</small></div><button class="x" type="button" data-a="close" aria-label="Cerrar">×</button></header>
  <div class="sec"><h5>Fondo</h5><div class="tiles" id="tiles">${THEMES.map(t=>`<button class="tile" type="button" data-a="theme" data-id="${t.id}" aria-pressed="false"><i style="background:${t.css}"></i><span>${t.name}</span></button>`).join('')}</div>
   <div class="ctl tg"><label>Tu propia imagen<small>Se queda en tu dispositivo</small></label><span><input id="bgfile" type="file" accept="image/*" hidden><button class="btn sm" type="button" data-a="pick">Subir</button></span></div>
   <div class="ctl tg"><label for="s-cpet">Pétalos sobre tu imagen</label><span class="sw-t"><input id="s-cpet" type="checkbox" data-k="cpet"><span></span></span></div></div>
  <div class="sec"><h5>Color de acento</h5><div class="sws">${[338,190,265,150,38,355,215].map(h=>`<button class="sw" type="button" data-a="hue" data-h="${h}" aria-label="Tono ${h}" style="background:hsl(${h} 100% 72%)"></button>`).join('')}</div>
   <div class="ctl"><label for="s-hue">Tono</label><output id="o-hue"></output><input id="s-hue" type="range" min="0" max="360" data-k="hue"></div></div>
  <div class="sec"><h5>Animación y rendimiento</h5>
   <div class="ctl tg"><label for="s-anim">Fondo animado</label><span class="sw-t"><input id="s-anim" type="checkbox" data-k="anim"><span></span></span></div>
   <div class="ctl tg"><label>Calidad<small id="qinfo"></small></label><span class="seg"><button type="button" data-k="quality" data-v="auto">Auto</button><button type="button" data-k="quality" data-v="high">Alta</button><button type="button" data-k="quality" data-v="mid">Media</button><button type="button" data-k="quality" data-v="low">Ahorro</button></span></div>
   <div class="ctl"><label for="s-speed">Velocidad</label><output id="o-speed"></output><input id="s-speed" type="range" min="0.2" max="2.5" step="0.1" data-k="speed"></div>
   <div class="ctl"><label for="s-par">Parallax (profundidad)</label><output id="o-par"></output><input id="s-par" type="range" min="0" max="2" step="0.1" data-k="par"></div>
   <div class="ctl"><label for="s-idle">Movimiento automático</label><output id="o-idle"></output><input id="s-idle" type="range" min="0" max="2" step="0.1" data-k="idle"></div>
   <div class="ctl tg"><label for="s-gyro">Girar con el móvil<small>Usa el giroscopio</small></label><span class="sw-t"><input id="s-gyro" type="checkbox" data-k="gyro"><span></span></span></div>
   <div class="ctl"><label for="s-dens">Densidad de partículas</label><output id="o-density"></output><input id="s-dens" type="range" min="0.3" max="1.6" step="0.1" data-k="density"></div>
   <div class="ctl"><label for="s-dim">Oscurecer el fondo</label><output id="o-dim"></output><input id="s-dim" type="range" min="0" max="80" data-k="dim"></div></div>
  <div class="sec"><h5>Cristal</h5>
   <div class="ctl"><label for="s-blur">Desenfoque (blur)</label><output id="o-blur"></output><input id="s-blur" type="range" min="0" max="40" data-k="blur"></div>
   <div class="ctl"><label for="s-glass">Opacidad de los paneles</label><output id="o-glass"></output><input id="s-glass" type="range" min="10" max="92" data-k="glass"></div>
   <div class="ctl"><label for="s-rad">Redondeo</label><output id="o-radius"></output><input id="s-rad" type="range" min="4" max="30" data-k="radius"></div></div>
  <div class="sec"><h5>Interfaz</h5>
   <div class="ctl tg"><label>Columnas de comandos</label><span class="seg"><button type="button" data-k="cols" data-v="1">1</button><button type="button" data-k="cols" data-v="2">2</button><button type="button" data-k="cols" data-v="3">3</button></span></div>
   <div class="ctl tg"><label>Visualizador</label><span class="seg"><button type="button" data-k="viz" data-v="bars">Barras</button><button type="button" data-k="viz" data-v="wave">Onda</button><button type="button" data-k="viz" data-v="off">Oculto</button></span></div>
   <div class="ctl tg"><label for="s-comp">Modo compacto</label><span class="sw-t"><input id="s-comp" type="checkbox" data-k="compact"><span></span></span></div>
   <div class="ctl tg"><label for="s-dots">Puntos de color por permiso</label><span class="sw-t"><input id="s-dots" type="checkbox" data-k="dots"><span></span></span></div>
   <div class="ctl tg"><label for="s-hap">Vibración al tocar</label><span class="sw-t"><input id="s-hap" type="checkbox" data-k="haptic"><span></span></span></div>
   <div class="ctl"><label for="s-font">Tamaño del texto</label><output id="o-font"></output><input id="s-font" type="range" min="0.85" max="1.3" step="0.05" data-k="font"></div></div>
  <div class="sec"><h5>Datos</h5><div class="btns3 two"><button class="btn" type="button" data-a="cfav">Borrar favoritos</button><button class="btn" type="button" data-a="crec">Borrar recientes</button></div><button class="btn danger" type="button" data-a="reset">Restablecer todo</button></div>`}

/* ───────── sheets ───────── */
let openId=null,cur=null;
function show(id){openId=id;$(id).classList.add('on');$('scrim').classList.add('on');$(id).setAttribute('aria-hidden','false');document.body.classList.add('sheet-open');drawViz.on=false}
function hide(){if(!openId)return;$(openId).classList.remove('on');$('scrim').classList.remove('on');$(openId).setAttribute('aria-hidden','true');openId=null;document.body.classList.remove('sheet-open');drawViz.on=S.viz!=='off'&&S.anim}
function openCmd(n){cur=CMDS.find(c=>c.name===n);if(!cur)return;
  $('sh-name').textContent=PREFIX+cur.name;$('sh-cat').textContent=catOf(cur.cat).name;$('sh-desc').textContent=cur.desc;$('sh-ex').textContent=cur.ex;$('sh-perm').textContent=cur.perm;$('sh-al').textContent=cur.alias;
  $('sh-try').href='https://wa.me/?text='+encodeURIComponent(cur.ex);favBtn();
  const rel=CMDS.filter(c=>c.cat===cur.cat&&c.name!==cur.name).slice(0,5);$('sh-rel').innerHTML=rel.map(c=>`<button class="chip sm glass" type="button" data-a="cmd" data-n="${c.name}">${PREFIX}${c.name}</button>`).join('');
  show('sheet');recent=[n,...recent.filter(x=>x!==n)].slice(0,8);saveR();bump('cmd');buzz(10);if(tab==='home')updHome()}
const favBtn=()=>{$('sh-fav').textContent=favs.has(cur.name)?'★ Guardado':'☆ Favorito'};
async function copy(t){try{await navigator.clipboard.writeText(t);toast('Copiado')}catch(e){const r=document.createRange();r.selectNodeContents($('sh-ex'));const s=getSelection();s.removeAllRanges();s.addRange(r);toast('Selecciona y copia el texto')}}

/* ───────── navegación ───────── */
function ensure(t){if(built[t])return;built[t]=1;const el=$('v-'+t);
  el.innerHTML={home:buildHome,cmds:buildCmds,ia:buildIA,group:buildGroup,extras:buildExtras,me:buildMe}[t]();
  if(t==='home'){updHome();vizInit()}if(t==='cmds')renderCmds();if(t==='ia')renderIA();if(t==='group')renderGroup();if(t==='extras')renderTools();if(t==='me')renderMe()}
function go(t,fromHash){if(!HASH[t])t='home';ensure(t);tab=t;
  document.querySelectorAll('.view').forEach(v=>{const on=v.id==='v-'+t;v.hidden=!on;if(on){v.classList.remove('in');void v.offsetWidth;v.classList.add('in')}});
  const i=TABS.findIndex(x=>x[0]===t);$('dock-i').style.transform=`translateX(${i*100}%)`;document.querySelectorAll('#dock button').forEach((b,j)=>b.setAttribute('aria-current',j===i?'page':'false'));
  if(!fromHash)try{history.replaceState(null,'','#'+HASH[t])}catch(e){}scrollTo({top:0});if(t==='home')updHome();if(t!=='extras')stopPom()}
addEventListener('hashchange',()=>{const t=Object.keys(HASH).find(k=>HASH[k]===location.hash.slice(1));if(t&&t!==tab)go(t,true)});

/* ───────── eventos ───────── */
document.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b)return;const a=b.dataset.a;
  if(a==='cmd'){openCmd(b.dataset.n)}
  else if(a==='cat'){cat=b.dataset.id;query='';$('q').value='';$('clr').hidden=true;showAll=false;renderCmds();b.scrollIntoView({inline:'center',block:'nearest',behavior:'smooth'})}
  else if(a==='pf'){pf=b.dataset.p;renderCmds()}else if(a==='sort'){sortAZ=!sortAZ;renderCmds()}else if(a==='more'){showAll=true;renderCmds()}
  else if(a==='clr'){$('q').value='';query='';b.hidden=true;renderCmds();$('q').focus()}
  else if(a==='model'){IA.model=b.dataset.id;saveI();renderIA();toast('Modelo: '+MODELS.find(m=>m.id===IA.model).name);buzz(10)}
  else if(a==='pers'){IA.pers=b.dataset.id;saveI();renderIA();toast('Personalidad: '+PERS.find(p=>p.id===IA.pers).n);buzz(10)}
  else if(a==='sug'){sendChat(b.textContent)}else if(a==='clrchat'){chat=[];LS.set('yoru3-chat',chat);renderMsgs();toast('Conversación borrada')}
  else if(a==='var'){const t=$('g-wel'),p=t.selectionStart||t.value.length;t.value=t.value.slice(0,p)+b.dataset.v+t.value.slice(p);G.wel=t.value;saveG();prevWel()}
  else if(a==='mact'){toast(b.dataset.t+' (ejemplo)');buzz(10)}
  else if(a==='tool'){tool=b.dataset.id;renderTools();bump('tool')}
  else if(a==='pmode'){stopPom();pom.m=+b.dataset.m;pom.left=pom.m*60;$('tool').innerHTML=pomHTML()}
  else if(a==='pgo'){if(pom.run){stopPom();b.textContent='Iniciar'}else{pom.run=true;pom.iv=setInterval(pomTick,1000);b.textContent='Pausar'}buzz(10)}
  else if(a==='preset'){stopPom();pom.left=pom.m*60;$('tool').innerHTML=pomHTML()}
  else if(a==='ck'){const k=b.dataset.k;if(k==='C')calc.e='';else if(k==='⌫')calc.e=calc.e.slice(0,-1);else if(k==='=')return calcEval();else calc.e+=k;$('cd').textContent=calc.e||'0';buzz(5)}
  else if(a==='rnd'){const w=b.dataset.w,o=$('rout');let v;if(w==='d6')v=1+Math.floor(Math.random()*6);else if(w==='d20')v=1+Math.floor(Math.random()*20);else if(w==='coin')v=Math.random()<.5?'Cara':'Cruz';else{const l=$('rlist').value.split('\n').map(x=>x.trim()).filter(Boolean);v=l.length?l[Math.floor(Math.random()*l.length)]:'—'}o.textContent=v;o.classList.remove('pop');void o.offsetWidth;o.classList.add('pop');bump('tool');buzz(15)}
  else if(a==='pgen'){const n=+$('plen').value,s=$('psym').checked,ch='abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'+(s?'!@#$%&*?-_':''),r=new Uint32Array(n);crypto.getRandomValues(r);$('pout').textContent=[...r].map(x=>ch[x%ch.length]).join('');bump('tool')}
  else if(a==='pcopy'){const t=$('pout').textContent;if(t!=='—'){navigator.clipboard.writeText(t).then(()=>toast('Copiado'),()=>toast('No se pudo copiar'))}}
  else if(a==='tc'){const i=+b.dataset.i;if(ttt.b[i]||winner(ttt.b))return;ttt.b[i]='X';let w=winner(ttt.b);if(!w){botMove();w=winner(ttt.b)}if(w==='X'){ttt.w++;addXp(10,10)}else if(w==='O')ttt.l++;else if(w==='D')ttt.d++;$('tool').innerHTML=tttHTML();buzz(10)}
  else if(a==='treset'){ttt.b=Array(9).fill('');$('tool').innerHTML=tttHTML()}
  else if(a==='mc'){const i=+b.dataset.i,c=memo.c[i];if(memo.lock||c.f||c.m)return;c.f=1;memo.open.push(i);if(memo.open.length===2){memo.mv++;memo.lock=true;const[x,y]=memo.open;if(memo.c[x].g===memo.c[y].g){memo.c[x].m=memo.c[y].m=1;memo.c[x].f=memo.c[y].f=0;memo.open=[];memo.lock=false;memo.done++;if(memo.done===6){toast('¡Completado en '+memo.mv+' movimientos!');addXp(15,15);bump('tool')}}else setTimeout(()=>{memo.c[x].f=memo.c[y].f=0;memo.open=[];memo.lock=false;if(tool==='mem')$('tool').innerHTML=memHTML()},650)}$('tool').innerHTML=memHTML();buzz(8)}
  else if(a==='mreset'){memInit();$('tool').innerHTML=memHTML()}
  else if(a==='ctype'){cv={t:b.dataset.t,a:0,b:1,v:cv.v};$('tool').innerHTML=convHTML();convCalc()}
  else if(a==='daily'){const now=Date.now();PR.streak=(now-PR.last<48*36e5&&PR.last)?PR.streak+1:1;PR.last=now;const rw=100+PR.streak*20;addXp(30,rw);toast('+'+rw+' monedas · racha '+PR.streak);confetti();buzz([30,40,30,40,60]);renderMe()}
  else if(a==='goto'){go(b.dataset.t)}
  else if(a==='close'){hide()}
  else if(a==='theme'){const t=THEMES.find(x=>x.id===b.dataset.id);if(t.id==='custom'&&!PR.custom){$('bgfile').click();return}S.scene=t.id;S.hue=t.hue;S.dim=t.dim;saveS();applyS();PR.cnt.theme++;checkAch();saveP();buzz(10)}
  else if(a==='hue'){S.hue=+b.dataset.h;saveS();applyS()}
  else if(a==='pick'){$('bgfile').click()}
  else if(a==='cfav'){favs.clear();saveF();toast('Favoritos borrados');if(built.cmds)renderCmds()}else if(a==='crec'){recent=[];saveR();toast('Recientes borrados');if(built.cmds)renderCmds();updHome()}
  else if(a==='reset'){S=Object.assign({},DEF);saveS();applyS();toast('Ajustes restablecidos')}});
document.addEventListener('input',e=>{const t=e.target;
  if(t.id==='q'){query=t.value.trim();$('clr').hidden=!query;showAll=false;renderCmds()}
  else if(t.dataset.i){const k=t.dataset.i;IA[k]=t.type==='range'?+t.value:t.type==='checkbox'?t.checked:t.value;if(k==='temp')$('o-temp').textContent=(+t.value).toFixed(2);saveI()}
  else if(t.dataset.gw){G[t.dataset.gw]=t.value;saveG();if(t.dataset.gw==='wel')prevWel()}
  else if(t.dataset.gt){G[t.dataset.gt]=t.value;saveG()}
  else if(t.id==='nt'){LS.set('yoru3-note',t.value)}
  else if(t.id==='plen'){$('o-plen').textContent=t.value}
  else if(t.id==='cvv'||t.id==='cva'||t.id==='cvb'){cv.v=parseFloat($('cvv').value)||0;cv.a=+$('cva').value;cv.b=+$('cvb').value;convCalc()}
  else if(t.closest('#set')&&t.dataset.k){const k=t.dataset.k;S[k]=t.type==='range'?+t.value:t.checked;saveS();applyS()}});
document.addEventListener('change',e=>{const t=e.target;
  if(t.dataset.g){G.sw[t.dataset.g]=t.checked;saveG();toast((t.checked?'Activado: ':'Desactivado: ')+t.closest('.trow').querySelector('b').textContent);buzz(10)}
  else if(t.id==='pname'){PR.name=t.value.trim()||'Invitado';saveP();updHome()}
  else if(t.id==='bgfile'&&t.files[0]){const f=t.files[0];useBlob(f).then(ok=>{if(!ok)return toast('No se pudo leer la imagen');IDB.put('bg',f);PR.custom=1;saveP();S.scene='custom';S.dim=Math.max(S.dim,30);saveS();applyS();toast('Fondo aplicado');checkAch()})}});
document.addEventListener('click',e=>{const b=e.target.closest('#set [data-v]');if(!b)return;const k=b.dataset.k;S[k]=isNaN(+b.dataset.v)?b.dataset.v:+b.dataset.v;saveS();applyS();if(k==='cols'&&built.cmds)renderCmds()});
document.addEventListener('submit',e=>{if(e.target.id==='cform'){e.preventDefault();const i=$('cin');sendChat(i.value);i.value=''}});
$('sh-copy').onclick=()=>copy(cur.ex.split(' ')[0]);
$('sh-fav').onclick=()=>{favs.has(cur.name)?favs.delete(cur.name):favs.add(cur.name);saveF();favBtn();if(built.cmds)renderCmds();checkAch();buzz(10)};
$('sh-close').onclick=$('sh-x').onclick=$('scrim').onclick=hide;
$('open-set').onclick=()=>{show('set');const q=BG.stats();$('qinfo').textContent=`Ahora: ${q.fps} fps · ${q.lv===0?'alta':q.lv===1?'media':'ahorro'}`};
addEventListener('keydown',e=>{if(e.key==='Escape')hide()});
$('dock').onclick=e=>{const b=e.target.closest('button');if(b){go(b.dataset.t);buzz(8)}};

/* ───────── visualizador (solo cuando se ve) ───────── */
let viz,vx,vgrad,vw=0,vh=0;
function vizInit(){viz=$('viz');if(!viz)return;vx=viz.getContext('2d');fitViz();new ResizeObserver(fitViz).observe(viz)}
function fitViz(){if(!viz)return;const r=viz.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);if(!r.width)return;vw=viz.width=Math.round(r.width*d);vh=viz.height=Math.round(r.height*d);vgrad=vx.createLinearGradient(0,0,0,vh);vgrad.addColorStop(0,`hsl(${S.hue} 100% 80%)`);vgrad.addColorStop(1,`hsla(${S.hue} 100% 75% / .2)`)}
let vlast=0;
function drawViz(ts){requestAnimationFrame(drawViz);if(!drawViz.on||tab!=='home'||!vx||!vw||ts-vlast<33)return;vlast=ts;vx.clearRect(0,0,vw,vh);vx.fillStyle=vgrad;vx.strokeStyle=vgrad;
  if(S.viz==='wave'){vx.lineWidth=2.2*(vh/56);vx.beginPath();for(let x=0;x<=vw;x+=4){const u=x/vw,y=vh/2+Math.sin(u*9+ts/300)*vh*.28*Math.sin(u*Math.PI)+Math.sin(u*21+ts/170)*vh*.08;x?vx.lineTo(x,y):vx.moveTo(x,y)}vx.stroke();return}
  const n=24,gap=vw/n,bw=gap*.6;for(let i=0;i<n;i++){const v=.5+.33*Math.sin(ts/420+i*.7)*Math.cos(ts/900+i*.31)+.12*Math.sin(ts/160+i*1.9),h=Math.max(4,Math.min(1,v)*vh*.95);vx.fillRect(i*gap+(gap-bw)/2,vh-h,bw,h)}}
drawViz.on=false;

/* ───────── arranque ───────── */
(function boot(){
  const nav=$('dock');nav.innerHTML='<i id="dock-i"></i>'+TABS.map(t=>`<button type="button" data-t="${t[0]}" aria-label="${t[1]}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${t[2]}"/></svg><span>${t[1]}</span></button>`).join('');
  buildSettings();applyS();
  const h=new Date().getHours();if(h<5)PR.owl=1;
  const t0=Object.keys(HASH).find(k=>HASH[k]===location.hash.slice(1))||'home';go(t0,true);
  requestAnimationFrame(drawViz);
  /* entrada del parallax: puntero/táctil, giroscopio y scroll */
  const nx=e=>(e.clientX/innerWidth-.5)*2,ny=e=>(e.clientY/innerHeight-.5)*2;
  addEventListener('pointermove',e=>{if(e.pointerType==='mouse'||e.buttons)BG.setPointer(nx(e),ny(e))},{passive:true});
  addEventListener('touchmove',e=>{const t=e.touches[0];if(t)BG.setPointer(nx(t),ny(t))},{passive:true});
  let gOn=false;const gy=e=>{if(!S.gyro||e.gamma==null)return;BG.setPointer(Math.max(-1,Math.min(1,e.gamma/28)),Math.max(-1,Math.min(1,(e.beta-45)/28)))};
  const gyroStart=()=>{if(gOn||typeof DeviceOrientationEvent==='undefined')return;
    const go=()=>{gOn=true;addEventListener('deviceorientation',gy,{passive:true})};
    if(typeof DeviceOrientationEvent.requestPermission==='function'){DeviceOrientationEvent.requestPermission().then(r=>{if(r==='granted')go()}).catch(()=>{})}else go()};
  addEventListener('pointerdown',()=>{if(S.gyro)gyroStart()},{once:true,passive:true});
  if(S.scene==='custom'||PR.custom)IDB.get('bg').then(b=>{if(b)useBlob(b)});
  checkAch()})();
