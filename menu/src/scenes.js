/* Motor de fondos. Cada escena prerenderiza sus capas estáticas una sola vez (cielo, montañas, nubes...)
   y por fotograma solo compone esas capas con drawImage más unas pocas partículas. La resolución y los
   fps bajan solos si el dispositivo no da la talla (calidad "Auto"). */
const BG=(()=>{
'use strict';
const cv=document.getElementById('bg');
const g=cv.getContext('2d',{alpha:false})||cv.getContext('2d');
const TAU=Math.PI*2;
let W=0,H=0,u=1,lv=0,cap=60,raf=0,last=0,T=0,sc=null,sid='sakura',bmp=null,fps=60,fn=0,fsum=0;
let hue=338,speed=1,dens=1,anim=true,qual='',cpet=true,shoot=[],rb=0,rt=0,lastW=0,lastH=0;
let PX=0,PY=0,tx=0,ty=0,par=1,idle=1,lastIn=0,fb=null,gsp=1;
const ZA=.05;
const KS=[1,.78,.55],PART=[1,.65,.4],CAP=[60,30,30];
const rng=s=>()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const mk=(w,h)=>{const c=document.createElement('canvas');c.width=Math.max(1,Math.round(w));c.height=Math.max(1,Math.round(h));return c};
const hsl=(h,s,l,a=1)=>`hsla(${((h%360)+360)%360},${s}%,${l}%,${a})`;
const lg=(c,x0,y0,x1,y1,st)=>{const q=c.createLinearGradient(x0,y0,x1,y1);for(const s of st)q.addColorStop(s[0],s[1]);return q};
const rg=(c,x,y,r0,r1,st)=>{const q=c.createRadialGradient(x,y,r0,x,y,r1);for(const s of st)q.addColorStop(s[0],s[1]);return q};
const rgba=(a,al)=>`rgba(${a[0]},${a[1]},${a[2]},${al})`;
const D=()=>dens*PART[lv];
/* parallax: d=0 lejano … 1 cercano. Escala un poco la capa para que nunca queden bordes vacíos. */
function Z(d){const a=par*ZA,s=par>0?1+2.1*a*d+.006:1;g.setTransform(s,0,0,s,W/2*(1-s)-PX*d*a*W,H/2*(1-s)-PY*d*a*W*.6)}
const ofs=d=>[-PX*d*par*ZA*W,-PY*d*par*ZA*W*.6];
function glow(size,h,s,l,a){const c=mk(size,size),x=c.getContext('2d');x.fillStyle=rg(x,size/2,size/2,0,size/2,[[0,hsl(h,s,l,a)],[.4,hsl(h,s,l,a*.32)],[1,hsl(h,s,l,0)]]);x.fillRect(0,0,size,size);return c}
function petalSpr(h){const c=mk(24,24),x=c.getContext('2d');x.translate(12,12);x.fillStyle=lg(x,-8,0,9,0,[[0,hsl(h,100,93,.95)],[1,hsl(h,100,72,.9)]]);x.beginPath();x.moveTo(-8,0);x.bezierCurveTo(-6,-8,6,-8,9,0);x.bezierCurveTo(6,6,-6,6,-8,0);x.fill();return c}
function starLayer(w,h,n,r,fade=1){const c=mk(w,h),x=c.getContext('2d');
  for(let i=0;i<n;i++){const px=r()*w,py=r()*h*fade,s=(r()<.07?2:r()<.3?1.2:.7)*u*(.8+r()*.6),a=.35+r()*.65,t=r();
    x.fillStyle=t<.15?`rgba(170,200,255,${a})`:t<.25?`rgba(255,225,180,${a})`:`rgba(255,255,255,${a})`;x.fillRect(px,py,s,s);
    if(s>1.8*u){x.fillStyle=`rgba(255,255,255,${a*.25})`;x.fillRect(px-s*1.5,py+s*.35,s*4,s*.3);x.fillRect(px+s*.35,py-s*1.5,s*.3,s*4)}}
  return c}
const twinkles=(n,r,fade)=>Array.from({length:Math.round(n)},()=>({x:r()*W,y:r()*H*fade,s:(1+r()*1.6)*u,p:r()*TAU,f:.6+r()*1.6}));
function drawTw(a,t){g.fillStyle='#fff';for(const s of a){g.globalAlpha=.2+.8*(.5+.5*Math.sin(t/600*s.f+s.p));g.fillRect(s.x,s.y,s.s,s.s)}g.globalAlpha=1}
function shootStars(dt,rate){
  if(Math.random()<rate*dt/1000)shoot.push({x:W*(.3+Math.random()*.8),y:Math.random()*H*.35,vx:-(.5+Math.random()*.5)*W*.0009,vy:(.12+Math.random()*.2)*W*.0009,l:0});
  g.lineCap='round';
  for(let i=shoot.length-1;i>=0;i--){const s=shoot[i];s.l+=dt;if(s.l>900){shoot.splice(i,1);continue}s.x+=s.vx*dt;s.y+=s.vy*dt;
    const a=Math.sin(s.l/900*Math.PI);g.strokeStyle=`rgba(255,255,255,${a*.85})`;g.lineWidth=1.5*u;g.beginPath();g.moveTo(s.x,s.y);g.lineTo(s.x-s.vx*95,s.y-s.vy*95);g.stroke()}
}
function ridge(c,w,h,base,amp,freq,ph,fill,r){c.beginPath();c.moveTo(0,h);const a=[r()*6,r()*6,r()*6];
  for(let x=0;x<=w+6;x+=6){const q=x/w*freq;c.lineTo(x,base-amp*(.55*Math.sin(q+ph+a[0])+.3*Math.sin(q*2.3+a[1])+.15*Math.sin(q*5.1+a[2])))}
  c.lineTo(w,h);c.closePath();c.fillStyle=fill;c.fill()}
function cloud(c,w,x,y,cw,ch,light,shade,r){
  const tw=Math.ceil(cw*1.35),th=Math.ceil(ch*2.6),t=mk(tw,th),x2=t.getContext('2d'),n=11+((r()*6)|0),ox=tw/2,oy=th*.6;
  for(let k=0;k<n;k++){const q=k/(n-1),bump=Math.sin(q*Math.PI),bx=ox+(q-.5)*cw*.9+(r()-.5)*cw*.12,by=oy-bump*ch*.32+(r()-.5)*ch*.16,rr=ch*(.26+.34*bump+r()*.12);
    x2.fillStyle=rg(x2,bx,by-rr*.2,rr*.1,rr,[[0,rgba(light,1)],[.55,rgba(light,.9)],[1,rgba(light,0)]]);x2.fillRect(bx-rr,by-rr,rr*2,rr*2)}
  x2.globalCompositeOperation='source-atop';x2.fillStyle=lg(x2,0,oy-ch*.55,0,oy+ch*.4,[[0,rgba(shade,0)],[.5,rgba(shade,.05)],[1,rgba(shade,.75)]]);x2.fillRect(0,0,tw,th);
  for(const o of [0,-w,w]){const px=x-ox+o;if(px+tw<0||px>w)continue;c.drawImage(t,px,y-oy)}}
const bez=(p0,p1,p2,p3,t)=>{const m=1-t;return m*m*m*p0+3*m*m*t*p1+3*m*t*t*p2+t*t*t*p3};
function branch(c,r,pts,w0,blos){ // pts: [x0,y0,x1,y1,x2,y2,x3,y3]
  c.strokeStyle='#0a0520';c.lineCap='round';
  for(let k=0;k<3;k++){c.lineWidth=w0*(1-k*.3);c.beginPath();c.moveTo(pts[0],pts[1]);c.bezierCurveTo(pts[2]+k*u*8,pts[3]+k*u*6,pts[4],pts[5]+k*u*5,pts[6]+k*u*12,pts[7]+k*u*4);c.stroke()}
  for(let i=0;i<blos;i++){const t=r(),x=bez(pts[0],pts[2],pts[4],pts[6],t)+(r()-.5)*40*u,y=bez(pts[1],pts[3],pts[5],pts[7],t)+(r()-.4)*34*u,s=(3+r()*7)*u;
    c.fillStyle=hsl(332+r()*22,70+r()*30,74+r()*16,.72+r()*.25);c.beginPath();c.arc(x,y,s,0,TAU);c.fill();
    if(r()<.35){c.fillStyle='rgba(255,235,245,.55)';c.beginPath();c.arc(x-s*.25,y-s*.25,s*.45,0,TAU);c.fill()}}}
function torii(c,x,y,s){c.fillStyle='#0c0624';const pw=7*s,ph=78*s,gap=46*s;
  c.fillRect(x-gap-pw/2,y-ph,pw,ph);c.fillRect(x+gap-pw/2,y-ph,pw,ph);c.fillRect(x-gap-6*s,y-ph*.74,gap*2+12*s,6*s);
  c.beginPath();c.moveTo(x-gap-24*s,y-ph-1*s);c.quadraticCurveTo(x,y-ph-15*s,x+gap+24*s,y-ph-1*s);c.lineTo(x+gap+17*s,y-ph+9*s);c.quadraticCurveTo(x,y-ph-1*s,x-gap-17*s,y-ph+9*s);c.closePath();c.fill();c.fillRect(x-4*s,y-ph*.92,8*s,ph*.2)}
function pagoda(c,x,y,s){c.fillStyle='#0c0624';let w=46*s,yy=y;
  for(let i=0;i<4;i++){const bh=16*s;c.fillStyle='#0c0624';c.fillRect(x-w*.32,yy-bh,w*.64,bh);c.beginPath();c.moveTo(x-w*.64,yy-bh);c.quadraticCurveTo(x-w*.3,yy-bh-3*s,x,yy-bh-12*s);c.quadraticCurveTo(x+w*.3,yy-bh-3*s,x+w*.64,yy-bh);c.closePath();c.fill();
    c.fillStyle='rgba(255,200,110,.9)';c.fillRect(x-2*s,yy-bh*.72,4*s,6*s);yy-=bh+8*s;w*=.82}
  c.fillStyle='#0c0624';c.fillRect(x-1.2*s,yy-14*s,2.4*s,18*s)}
function mist(w,h,a){const c=mk(w,h),x=c.getContext('2d');for(let i=0;i<7;i++){const cx=w*(i/6),r=h*(.6+.3*Math.sin(i*2.1)),cy=h*.55;x.save();x.translate(cx,cy);x.scale(2.4,1);x.fillStyle=rg(x,0,0,0,r,[[0,`rgba(210,220,255,${a})`],[1,'rgba(210,220,255,0)']]);x.fillRect(-r,-r,r*2,r*2);x.restore()}return c}

/* partículas genéricas (pétalos, semillas) */
function mkPet(n,r){return Array.from({length:Math.round(n)},()=>({x:r()*W,y:r()*H,s:(7+r()*12)*u,vy:.02+r()*.035,vx:.012+r()*.02,r:r()*TAU,vr:(r()-.5)*.003,ph:r()*TAU,d:.5+r()*.5}))}
function drawPet(a,spr,t,dt,wind=1){for(const p of a){p.y+=p.vy*dt*u;p.x+=(p.vx+Math.sin(t/1100+p.ph)*.012)*dt*u*wind;p.r+=p.vr*dt;
  if(p.y>H+20||p.x>W+20){p.y=-20;p.x=Math.random()*W*1.1-W*.1}
  const k=p.s/24*(.65+.6*p.d),o=ofs(.35+p.d*.9),c=Math.cos(p.r)*k,s=Math.sin(p.r)*k,f=.35+.65*Math.abs(Math.sin(t/700+p.ph));g.setTransform(c,s,-s*f,c*f,p.x+o[0],p.y+o[1]);g.globalAlpha=.5+.5*p.d;g.drawImage(spr,-12,-12)}
  g.setTransform(1,0,0,1,0,0);g.globalAlpha=1}
function add(img,x,y,a=1){g.globalCompositeOperation='lighter';g.globalAlpha=a;g.drawImage(img,x,y);g.globalAlpha=1;g.globalCompositeOperation='source-over'}
function addS(img,x,y,w,h,a=1){g.globalCompositeOperation='lighter';g.globalAlpha=a;g.drawImage(img,x,y,w,h);g.globalAlpha=1;g.globalCompositeOperation='source-over'}

/* ───────── Gargantúa: WebGL (geodésicas de Schwarzschild) ───────── */
const GLX=(()=>{
const VS='attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
const FS=`precision highp float;
uniform vec2 R;uniform float T,HUE,PX,PY,PAR,DN,SPD;uniform int NS;
const float PI=3.14159265;
float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float h31(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h21(i),h21(i+vec2(1.,0.)),f.x),mix(h21(i+vec2(0.,1.)),h21(i+vec2(1.)),f.x),f.y);}
float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<4;i++){s+=a*vn(p);p=p*2.03+7.1;a*=.5;}return s;}
vec3 hsv(float h,float s,float v){vec3 k=clamp(abs(fract(h+vec3(0.,.6667,.3333))*6.-3.)-1.,0.,1.);return v*mix(vec3(1.),k,s);}
vec3 stars(vec3 d){vec3 col=vec3(0.);
  for(int L=0;L<3;L++){float sc=70.+float(L)*85.;vec3 p=d*sc,id=floor(p),f=fract(p)-.5;float h=h31(id+float(L)*17.);
    if(h>.945){vec3 o=vec3(h31(id+3.1),h31(id+7.7),h31(id+9.3))-.5;float dd=length(f-o*.6);
      float b=smoothstep(.2/(1.+float(L)*.6),0.,dd)*(.35+.65*h31(id+1.3));
      vec3 tn=mix(vec3(.65,.78,1.),vec3(1.,.82,.62),h31(id+5.5));col+=tn*b*(1.+4.*step(.99,h));}}
  return col;}
vec3 sky(vec3 d){
  vec3 n=normalize(vec3(.35,.8,.45));float band=dot(d,n);
  float ph=atan(d.z,d.x);float cl=fbm(vec2(ph*2.6,band*9.))*fbm(vec2(ph*6.+3.,band*22.));
  float core=exp(-band*band*26.)*(.35+1.1*cl);float wide=exp(-band*band*5.)*.07;
  vec3 mw=core*vec3(.5,.52,.7)+wide*vec3(.16,.22,.5);
  float dust=smoothstep(.45,.7,fbm(vec2(ph*5.+9.,band*30.)));mw*=1.-.55*dust*exp(-band*band*18.);
  return stars(d)*(.8+.5*core)+mw*.55;}
void main(){
  vec2 q=(gl_FragCoord.xy-.5*R)/R.y;float asp=R.x/R.y;
  float zf=clamp(.58/(.5*asp),.52,2.1);
  q.y-=.035;
  float yaw=PX*.3*PAR+.05*sin(T*.00011),pit=.095+PY*.07*PAR+.012*sin(T*.00017);
  float dist=14.;
  vec3 ro=dist*vec3(sin(yaw)*cos(pit),sin(pit),-cos(yaw)*cos(pit));
  vec3 fw=normalize(-ro),rt=normalize(cross(vec3(0.,1.,0.),fw)),up=cross(fw,rt);
  vec3 rd=normalize(fw+(q.x*rt+q.y*up)*zf);
  vec3 p=ro,v=rd;vec3 hv=cross(p,v);float h2=dot(hv,hv);
  vec3 acc=vec3(0.);float tr=1.;
  vec3 hc=hsv(HUE/360.,.8,1.);
  float pv=p.y;bool esc=false;
  for(int i=0;i<130;i++){
    if(i>=NS)break;
    float r=length(p);
    if(r<1.){tr=0.;break;}
    if(r>28.&&dot(p,v)>0.){esc=true;break;}
    float ds=clamp(.05*r,.035,.7);
    // halo volumétrico del disco
    if(r<10.){float hz=exp(-p.y*p.y*1.6)/(1.+(r-2.4)*(r-2.4)*.1);acc+=tr*hc*vec3(1.,.82,.6)*.012*ds*hz*DN;}
    v+=-1.5*h2*p/(r*r*r*r*r)*ds;
    vec3 np=p+v*ds;
    if(pv*np.y<0.&&tr>.02){
      float k=pv/(pv-np.y);vec3 hit=mix(p,np,k);float rr=length(hit.xz);
      if(rr>2.5&&rr<12.){
        float ph=atan(hit.z,hit.x),w=T*.00055*SPD*2.2/(rr*sqrt(rr));
        float tex=fbm(vec2(rr*7.,(ph-w)*2.1))*.75+.25*vn(vec2(rr*40.,(ph-w)*.9));
        float rings=.86+.14*vn(vec2(rr*14.,ph*3.));
        vec3 vd=normalize(vec3(-hit.z,0.,hit.x))*sqrt(.5/rr);float b2=dot(vd,vd);
        float dop=sqrt(max(.01,1.-b2))/(1.+dot(vd,normalize(v)));
        float gz=sqrt(max(.05,1.-1./rr));float g=dop*gz;
        float edge=smoothstep(2.5,3.1,rr)*(1.-smoothstep(8.,12.,rr));
        float temp=pow(2.7/rr,.9);
        float inten=temp*(.35+1.1*tex)*rings*edge*mix(1.,pow(g,3.),.62);
        float kk=clamp(temp*g*1.15,0.,1.);
        vec3 deep=hc*.2,mid=hc*vec3(1.,.8,.6),hot=vec3(1.,.93,.82);
        vec3 col=mix(mix(deep,mid,smoothstep(0.,.55,kk)),hot,smoothstep(.55,1.,kk));
        float a=clamp(inten*2.4*DN,0.,.96);
        acc+=tr*col*inten*3.1*DN;tr*=1.-a;}
    }
    pv=np.y;p=np;
  }
  vec3 col=acc;
  if(tr>.003){vec3 d=normalize(v);col+=tr*sky(d);}
  // polvo cercano en capas (paralaje real respecto al fondo)
  for(int L=0;L<3;L++){float fl=float(L);float dp=.025+fl*.04;vec2 uv=q*(2.2+fl*1.7)+vec2(PX,PY)*PAR*dp*(5.+fl*5.)+vec2(T*.00002*(1.+fl),T*.000012*fl);
    vec2 id=floor(uv),f=fract(uv)-.5;float h=h21(id+fl*13.);
    if(h>.93){vec2 o=vec2(h21(id+3.3),h21(id+8.1))-.5;float dd=length(f-o*.6);float tw=.6+.4*sin(T*.002+h*40.);
      col+=hc*vec3(1.,.9,.8)*smoothstep(.2+fl*.06,0.,dd)*.07*tw*(.5+fl*.35);}}
  col=1.-exp(-col*1.25);
  col=pow(col,vec3(.92));
  float vg=1.-.42*dot(q*vec2(.9,.7),q*vec2(.9,.7));col*=clamp(vg,0.,1.);
  col+=(h21(gl_FragCoord.xy+fract(T*.001)*100.)-.5)*.012;
  gl_FragColor=vec4(col,1.);}`;
let cv2=null,gl=null,pr=null,U={},ok=null,gw=0,gh=0;
function sh(t,s){const x=gl.createShader(t);gl.shaderSource(x,s);gl.compileShader(x);if(!gl.getShaderParameter(x,gl.COMPILE_STATUS)){GLX.err=gl.getShaderInfoLog(x);return null}return x}
function init(){
  if(ok!==null)return ok;ok=false;
  try{cv2=document.createElement('canvas');cv2.id='bg3d';cv2.setAttribute('aria-hidden','true');cv2.style.cssText='position:fixed;inset:0;width:100%;height:100%;z-index:-2;display:none;background:#000';
    cv.parentNode.insertBefore(cv2,cv.nextSibling);
    gl=cv2.getContext('webgl',{antialias:false,alpha:false,depth:false,stencil:false,powerPreference:'high-performance',preserveDrawingBuffer:false});if(!gl)return ok;
    const pf=gl.getShaderPrecisionFormat&&gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER,gl.HIGH_FLOAT);if(pf&&pf.precision===0)return ok;
    const a=sh(gl.VERTEX_SHADER,VS),b=sh(gl.FRAGMENT_SHADER,FS);if(!a||!b)return ok;
    pr=gl.createProgram();gl.attachShader(pr,a);gl.attachShader(pr,b);gl.linkProgram(pr);if(!gl.getProgramParameter(pr,gl.LINK_STATUS)){GLX.err=gl.getProgramInfoLog(pr);return ok}
    gl.useProgram(pr);const bf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,bf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
    const loc=gl.getAttribLocation(pr,'a');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
    for(const n of ['R','T','HUE','PX','PY','PAR','DN','SPD','NS'])U[n]=gl.getUniformLocation(pr,n);
    cv2.addEventListener('webglcontextlost',e=>{e.preventDefault();ok=null;GLX.lost=true});
    ok=true}catch(e){GLX.err=String(e);ok=false}
  return ok}
return{
  err:'',lost:false,
  try:init,
  show(v){if(!cv2&&!v)return;if(cv2)cv2.style.display=v?'block':'none';cv.style.display=v?'none':'block'},
  size(k){const dpr=Math.min(devicePixelRatio||1,1.5);gw=Math.max(2,Math.round(innerWidth*k*dpr*.78));gh=Math.max(2,Math.round(innerHeight*k*dpr*.78));
    if(cv2.width!==gw||cv2.height!==gh){cv2.width=gw;cv2.height=gh}gl.viewport(0,0,gw,gh)},
  draw(t,o){if(!ok||gl.isContextLost())return;
    gl.uniform2f(U.R,gw,gh);gl.uniform1f(U.T,t);gl.uniform1f(U.HUE,o.hue);gl.uniform1f(U.PX,o.px);gl.uniform1f(U.PY,o.py);gl.uniform1f(U.PAR,o.par);gl.uniform1f(U.DN,o.dn);gl.uniform1f(U.SPD,1);gl.uniform1i(U.NS,o.ns);
    gl.drawArrays(gl.TRIANGLES,0,3)}
}})();

/* ───────── 1. Sakura de noche ───────── */
function sakura(){let sky,far,mid,near,mi,spr,pet,ff,tw,lamps,gO,gF;
return{usesHue:1,
init(){const r=rng(7);
  sky=mk(W,H);let c=sky.getContext('2d');
  c.fillStyle=lg(c,0,0,0,H,[[0,'#04061a'],[.38,'#131a55'],[.66,'#4a2f78'],[.86,'#a2527f'],[1,'#d98a9c']]);c.fillRect(0,0,W,H);
  for(const b of [[.18,.22,.55,'rgba(110,90,255,.22)'],[.85,.4,.5,'rgba(255,100,170,.17)'],[.5,.12,.4,'rgba(70,160,255,.12)']]){c.fillStyle=rg(c,b[0]*W,b[1]*H,0,b[2]*W,[[0,b[3]],[1,'rgba(0,0,0,0)']]);c.fillRect(0,0,W,H)}
  c.drawImage(starLayer(W,H,Math.round(300*D()),r,.72),0,0);
  const mx=W*.72,my=H*.16,mr=Math.min(W,H)*.085;
  c.fillStyle=rg(c,mx,my,mr*.8,mr*6,[[0,'rgba(190,210,255,.5)'],[.25,'rgba(150,170,255,.16)'],[1,'rgba(0,0,0,0)']]);c.fillRect(0,0,W,H);
  c.fillStyle=rg(c,mx-mr*.3,my-mr*.3,mr*.1,mr,[[0,'#fff'],[.7,'#dfe8ff'],[1,'#a9bdf2']]);c.beginPath();c.arc(mx,my,mr,0,TAU);c.fill();
  c.fillStyle='rgba(120,140,200,.18)';for(let i=0;i<6;i++){c.beginPath();c.arc(mx+(r()-.5)*mr,my+(r()-.5)*mr,mr*(.08+r()*.14),0,TAU);c.fill()}
  far=mk(W,H);c=far.getContext('2d');ridge(c,W,H,H*.72,H*.14,4,0,'rgba(70,42,118,.82)',r);ridge(c,W,H,H*.79,H*.1,6,2,'rgba(42,26,88,.94)',r);
  mid=mk(W,H);c=mid.getContext('2d');ridge(c,W,H,H*.85,H*.07,5,1,'#120b33',r);torii(c,W*.27,H*.815,u*1.15);pagoda(c,W*.8,H*.82,u*1.1);
  lamps=[];const x0=W*.42,x1=W*.66,y0=H*.79,y1=H*.775;c.strokeStyle='#0c0624';c.lineWidth=1.2*u;c.beginPath();
  for(let i=0;i<=24;i++){const t=i/24,x=x0+(x1-x0)*t,y=y0+(y1-y0)*t+Math.sin(t*Math.PI)*14*u;i?c.lineTo(x,y):c.moveTo(x,y)}c.stroke();
  c.fillStyle='#0c0624';c.fillRect(x0-2*u,y0-6*u,3*u,30*u);c.fillRect(x1-1*u,y1-6*u,3*u,30*u);
  for(let i=1;i<8;i++){const t=i/8,x=x0+(x1-x0)*t,y=y0+(y1-y0)*t+Math.sin(t*Math.PI)*14*u+7*u;c.fillStyle='rgba(255,150,70,.95)';c.beginPath();c.ellipse(x,y,3.2*u,4.4*u,0,0,TAU);c.fill();lamps.push({x,y,p:r()*TAU})}
  near=mk(W,H);c=near.getContext('2d');ridge(c,W,H,H*.96,H*.035,3,.5,'#07041a',r);
  branch(c,r,[W+12*u,H*.035,W*.82,H*.03,W*.7,H*.11,W*.5,H*.15],8*u,170);branch(c,r,[-12*u,H*.06,W*.12,H*.07,W*.2,H*.1,W*.34,H*.085],6*u,90);
  mi=mist(W*1.6,H*.2,.2);gO=glow(64,28,100,62,.9);gF=glow(24,60,100,75,.95);spr=petalSpr(hue);
  pet=mkPet(46*D(),r);ff=Array.from({length:Math.round(16*D())},()=>({x:r()*W,y:H*(.5+r()*.45),ph:r()*TAU,s:(8+r()*8)*u}));tw=twinkles(26*D(),r,.6)},
draw(t,dt){Z(.02);g.drawImage(sky,0,0);drawTw(tw,t);shootStars(dt,.08);
  Z(.14);g.drawImage(far,0,Math.sin(t/9000)*2*u);Z(.28);g.globalAlpha=.9;g.drawImage(mi,-W*.3+Math.sin(t/8000)*W*.12,H*.66);g.globalAlpha=1;
  Z(.46);g.drawImage(mid,0,0);
  g.globalCompositeOperation='lighter';for(const l of lamps){g.globalAlpha=.65+.35*Math.sin(t/260+l.p);g.drawImage(gO,l.x-18*u,l.y-18*u,36*u,36*u)}g.globalAlpha=1;g.globalCompositeOperation='source-over';
  Z(.66);g.globalAlpha=.8;g.drawImage(mi,-W*.5+Math.cos(t/9000)*W*.15,H*.82);g.globalAlpha=1;
  Z(.9);g.drawImage(near,0,0);
  g.globalCompositeOperation='lighter';for(const f of ff){f.x+=Math.sin(t/900+f.ph)*.03*dt*u;f.y+=Math.cos(t/1300+f.ph)*.02*dt*u;g.globalAlpha=.3+.7*(.5+.5*Math.sin(t/500+f.ph*3));g.drawImage(gF,f.x,f.y,f.s,f.s)}g.globalAlpha=1;g.globalCompositeOperation='source-over';
  drawPet(pet,spr,t,dt)}}}

/* ───────── 2. Agujero negro ───────── */
function holeFB(){let base,A,B,gl,cx,cy,R,tilt=.22,disk,pal,bufs;
const NB=16;
return{usesHue:1,
init(){const r=rng(3);R=Math.min(W,H)*.12;cx=W*.5;cy=H*.27;
  base=mk(W,H);let c=base.getContext('2d');c.fillStyle='#02020a';c.fillRect(0,0,W,H);
  for(const b of [[.15,.75,.7,'rgba(70,40,150,.18)'],[.9,.55,.6,'rgba(30,90,160,.12)']]){c.fillStyle=rg(c,b[0]*W,b[1]*H,0,b[2]*W,[[0,b[3]],[1,'rgba(0,0,0,0)']]);c.fillRect(0,0,W,H)}
  const n=Math.round(420*D());
  for(let i=0;i<n;i++){let x=r()*W,y=r()*H;const dx=x-cx,dy=y-cy,d=Math.hypot(dx,dy);if(d<R*1.08)continue;const k=1+.9*R*R/(d*d);x=cx+dx*k;y=cy+dy*k;
    const s=(r()<.1?2:r()<.4?1.2:.7)*u,a=.3+r()*.7;c.fillStyle=r()<.2?`rgba(170,200,255,${a})`:`rgba(255,255,255,${a})`;c.fillRect(x,y,s,s)}
  gl=glow(256,hue,100,62,.55);
  // capa A: halo + arcos lensados + mitad trasera del disco
  A=mk(W,H);c=A.getContext('2d');
  c.fillStyle=rg(c,cx,cy,R*.9,R*7,[[0,hsl(hue,100,60,.34)],[.3,hsl(hue,90,38,.13)],[1,'rgba(0,0,0,0)']]);c.fillRect(0,0,W,H);
  const dop=(rad,a)=>lg(c,cx-rad,0,cx+rad,0,[[0,hsl(hue,100,88,a)],[.45,hsl(hue,100,62,a*.65)],[1,hsl(hue,100,40,a*.28)]]);
  c.lineCap='round';
  for(let j=0;j<12;j++){const rad=R*(1.06+j*.045),a=.5*(1-j/12);c.lineWidth=R*.05;c.strokeStyle=dop(rad,a);c.beginPath();c.arc(cx,cy,rad,Math.PI*1.04,Math.PI*1.96);c.stroke();
    c.strokeStyle=dop(rad*.95,a*.5);c.beginPath();c.arc(cx,cy,rad*.97,Math.PI*.12,Math.PI*.88);c.stroke()}
  for(let k=0;k<48;k++){const rad=R*(1.45+k*.068),a=Math.pow(1-k/48,1.25)*.42+.03;c.lineWidth=R*.075;c.strokeStyle=dop(rad,a);c.beginPath();c.ellipse(cx,cy,rad,rad*tilt,0,Math.PI,TAU);c.stroke()}
  c.lineWidth=R*.045;c.strokeStyle=hsl(hue,100,92,.95);c.beginPath();c.arc(cx,cy,R*1.03,0,TAU);c.stroke();
  // capa B: mitad delantera del disco
  B=mk(W,H);c=B.getContext('2d');c.lineCap='round';
  for(let k=0;k<48;k++){const rad=R*(1.45+k*.068),a=Math.pow(1-k/48,1.25)*.55+.04;c.lineWidth=R*.075;c.strokeStyle=lg(c,cx-rad,0,cx+rad,0,[[0,hsl(hue,100,90,a)],[.45,hsl(hue,100,64,a*.7)],[1,hsl(hue,100,42,a*.32)]]);c.beginPath();c.ellipse(cx,cy,rad,rad*tilt,0,0,Math.PI);c.stroke()}
  disk=Array.from({length:Math.round(1000*D())},()=>({r:1.5+Math.pow(r(),1.7)*3.6,th:r()*TAU,sz:(1+r()*1.8)*u}));
  pal=[];for(let rb=0;rb<4;rb++)for(let bb=0;bb<4;bb++)pal.push(hsl(hue+rb*6-10,95,Math.min(94,56+(3-rb)*9+bb*6),.4+bb*.17));
  bufs=[0,1].map(()=>Array.from({length:NB},()=>({a:[],n:0})))},
draw(t,dt){Z(.3);g.drawImage(base,0,0);addS(gl,cx-R*5,cy-R*5,R*10,R*10,.8+.2*Math.sin(t/1400));
  g.drawImage(A,0,0);
  for(const s of bufs)for(const b of s)b.n=0;
  for(const p of disk){p.th+=dt*.0016*(1.9/Math.pow(p.r,1.5));const s=Math.sin(p.th),front=s>=0,x=cx+R*p.r*Math.cos(p.th);
    const y=front?cy+R*p.r*s*tilt:cy-R*(1.07+.17*(p.r-1.5))*Math.pow(-s,.82);
    const b=.55+.45*Math.cos(p.th+.6),bb=Math.max(0,Math.min(3,((b-.1)*3.2)|0)),rb=Math.max(0,Math.min(3,((p.r-1.5)/3.6*4)|0)),bk=bufs[front?1:0][rb*4+bb];
    bk.a[bk.n++]=x;bk.a[bk.n++]=y;bk.a[bk.n++]=p.sz}
  const flush=s=>{for(let k=0;k<NB;k++){const b=bufs[s][k];if(!b.n)continue;g.fillStyle=pal[k];g.beginPath();for(let i=0;i<b.n;i+=3)g.rect(b.a[i],b.a[i+1],b.a[i+2],b.a[i+2]);g.fill()}};
  flush(0);g.fillStyle='#000';g.beginPath();g.arc(cx,cy,R,0,TAU);g.fill();g.drawImage(B,0,0);flush(1)}}}

/* ───────── 3. Aurora ───────── */
function aurora(){let base,sky0,ac,strips,hz,tw;
return{usesHue:1,
init(){const r=rng(21);hz=H*.74;base=mk(W,H);let c=base.getContext('2d');
  c.fillStyle=lg(c,0,0,0,hz,[[0,'#020716'],[.6,'#071a2e'],[1,'#0d2a3a']]);c.fillRect(0,0,W,H);
  c.drawImage(starLayer(W,H,Math.round(320*D()),r,.7),0,0);
  sky0=base;base=mk(W,H);c=base.getContext('2d');
  ridge(c,W,hz+4,hz*.9,hz*.12,3,0,'#07131f',r);ridge(c,W,hz+4,hz*.97,hz*.07,5,2,'#040c15',r);
  // pinos
  c.fillStyle='#020810';for(let i=0;i<46;i++){const x=r()*W*.55+(i%2?0:W*.5),h=(18+r()*40)*u,w=h*.32,y=hz+2;c.beginPath();c.moveTo(x,y-h);c.lineTo(x+w,y);c.lineTo(x-w,y);c.fill()}
  // lago
  c.fillStyle=lg(c,0,hz,0,H,[[0,'#0b2433'],[1,'#02070f']]);c.fillRect(0,hz,W,H-hz);
  c.globalAlpha=.4;c.save();c.translate(0,hz*2);c.scale(1,-1);c.drawImage(starLayer(W,hz,Math.round(90*D()),r,1),0,0);c.restore();c.globalAlpha=1;
  ac=mk(Math.round(W/2),Math.round(hz/2));strips=[0,1,2].map(k=>{const s=mk(2,256),x=s.getContext('2d'),h=hue+(k-1)*38;x.fillStyle=lg(x,0,0,0,256,[[0,hsl(h,95,62,0)],[.18,hsl(h,95,64,.9)],[.55,hsl(h,90,52,.45)],[1,hsl(h,90,45,0)]]);x.fillRect(0,0,2,256);return s});
  tw=twinkles(24*D(),r,.6)},
draw(t,dt){Z(.03);g.drawImage(sky0,0,0);drawTw(tw,t);
  const x=ac.getContext('2d'),aw=ac.width,ah=ac.height;x.clearRect(0,0,aw,ah);x.globalCompositeOperation='lighter';
  for(let b=0;b<3;b++){const baseY=ah*(.18+b*.1),amp=ah*(.08+b*.012),th=ah*(.5-b*.05);
    for(let i=0;i<aw;i+=3){const q=i/aw*(3+b*.6)+t*.00026*(1+b*.3)+b*1.7,y=baseY+amp*(Math.sin(q)+.5*Math.sin(q*2.1+t*.0004)),a=.55*(.55+.45*Math.sin(i*.06+t*.0011+b)),h=th*(.7+.3*Math.sin(i*.04+t*.0008+b*2));
      x.globalAlpha=a;x.drawImage(strips[b],i,y,3.4,h)}}
  Z(.16);g.globalCompositeOperation='lighter';g.imageSmoothingEnabled=true;g.drawImage(ac,0,0,W,hz);g.globalCompositeOperation='source-over';
  Z(.62);g.drawImage(base,0,0);g.globalCompositeOperation='lighter';
  g.save();g.beginPath();g.rect(0,hz,W,H-hz);g.clip();g.translate(0,hz*2);g.scale(1,-1);g.globalAlpha=.32;g.drawImage(ac,0,0,W,hz);g.restore();
  g.globalAlpha=1;g.globalCompositeOperation='source-over';shootStars(dt,.1)}}}

/* ───────── 4. Neón retro ───────── */
function neon(){let base,hz,tw,gl,sr;
return{usesHue:1,
init(){const r=rng(5);hz=H*.56;sr=Math.min(W,H)*.2;base=mk(W,H);let c=base.getContext('2d');
  c.fillStyle='#0a0320';c.fillRect(0,0,W,H);c.fillStyle=lg(c,0,0,0,hz,[[0,'#0d0527'],[.65,'#3f125e'],[1,hsl(hue+40,90,46,1)]]);c.fillRect(0,0,W,hz);
  c.drawImage(starLayer(W,H,Math.round(220*D()),r,.5),0,0);
  const s=mk(sr*2,sr*2),x=s.getContext('2d');x.fillStyle=lg(x,0,0,0,sr*2,[[0,hsl(hue-60,100,74)],[1,hsl(hue+20,100,58)]]);x.beginPath();x.arc(sr,sr,sr,0,TAU);x.fill();
  x.globalCompositeOperation='destination-out';for(let i=0;i<8;i++){const y=sr*1.05+i*sr*.12,h=sr*.012*(i+1)*1.15;x.fillRect(0,y,sr*2,h)}
  c.drawImage(s,W/2-sr,hz-sr*1.15);
  // skyline
  c.fillStyle='#10042a';let xx=0;while(xx<W){const w=(14+r()*30)*u,h=(20+r()*70)*u;c.fillRect(xx,hz-h,w,h);c.fillStyle='rgba(255,190,90,.8)';for(let k=0;k<3;k++)if(r()<.5)c.fillRect(xx+r()*(w-3*u),hz-h+r()*h*.8,2*u,2*u);c.fillStyle='#10042a';xx+=w+2*u}
  c.fillStyle=lg(c,0,hz,0,H,[[0,'#16063a'],[1,'#07011a']]);c.fillRect(0,hz,W,H-hz);
  gl=glow(256,hue,100,60,.55);tw=twinkles(20*D(),r,.45)},
draw(t,dt){Z(.05);g.drawImage(base,0,0);drawTw(tw,t);addS(gl,W/2-sr*2.4,hz-sr*1.5,sr*4.8,sr*3,.7+.3*Math.sin(t/900));
  Z(.55);g.strokeStyle=hsl(hue,100,68,.8);g.lineWidth=1.2*u;const n=14,ph=(t*.0005)%1;
  for(let i=0;i<n;i++){const p=(i+ph)/n,y=hz+(H-hz)*p*p;g.globalAlpha=.2+.8*p;g.beginPath();g.moveTo(0,y);g.lineTo(W,y);g.stroke()}
  g.globalAlpha=.55;g.beginPath();for(let j=-14;j<=14;j++){g.moveTo(W/2+j*7*u,hz);g.lineTo(W/2+j*W*.1,H)}g.stroke();g.globalAlpha=1;
  shootStars(dt,.05)}}}

/* ───────── 5. Ciudad bajo la lluvia ───────── */
function rain(){let base,drops,drops2,rip,tw,flash=0,nextL=4000,bokeh,umb;
return{usesHue:1,
init(){const r=rng(9);base=mk(W,H);let c=base.getContext('2d');const hz=H*.7;
  c.fillStyle=lg(c,0,0,0,H,[[0,'#070615'],[.55,'#17123a'],[.78,'#2b1a4d'],[1,'#0b0618']]);c.fillRect(0,0,W,H);
  for(const row of [[.5,'#0e0a2a',.9],[.7,'#0a0720',1.3]]){let x=-10;while(x<W){const w=(18+r()*40)*u*row[2],h=(60+r()*H*.28)*row[2]*(row[0]+.3);c.fillStyle=row[1];c.fillRect(x,hz-h,w,h);
    for(let k=0;k<Math.round(w*h/(260*u*u));k++)if(r()<.55){c.fillStyle=r()<.7?'rgba(255,205,120,.75)':r()<.5?'rgba(120,220,255,.7)':hsl(hue,100,75,.75);c.fillRect(x+3*u+r()*(w-6*u),hz-h+4*u+r()*(h-8*u),2*u,3*u)}x+=w+2*u}}
  // neones
  for(const n of [[.12,.42,hue],[.8,.36,190],[.55,.5,300]]){const x=W*n[0],y=H*n[1],w=14*u,h=70*u;c.fillStyle=hsl(n[2],100,70,.95);c.fillRect(x,y,w,h);c.fillStyle=rg(c,x+w/2,y+h/2,0,h*1.4,[[0,hsl(n[2],100,60,.45)],[1,hsl(n[2],100,60,0)]]);c.fillRect(x-h*1.4,y-h*1.2,h*3.4,h*3.4)}
  // calle mojada
  c.fillStyle=lg(c,0,hz,0,H,[[0,'#171033'],[1,'#05030f']]);c.fillRect(0,hz,W,H-hz);
  for(const n of [[.12,hue],[.8,190],[.55,300],[.3,35],[.68,35]]){const x=W*n[0];c.fillStyle=lg(c,0,hz,0,H,[[0,hsl(n[1],100,60,.38)],[1,hsl(n[1],100,60,0)]]);c.fillRect(x-10*u,hz,20*u,H-hz)}
  bokeh=Array.from({length:Math.round(22*D())},()=>({x:r()*W,y:H*(.55+r()*.35),s:(14+r()*34)*u,spr:glow(64,[hue,190,300,35][(r()*4)|0],100,64,.5),ph:r()*TAU}));
  umb=mk(W,H);c=umb.getContext('2d');const px=W*.62,py=H*.9,s=u*1.3;c.fillStyle='#05030e';c.beginPath();c.arc(px,py-52*s,30*s,Math.PI,TAU);c.fill();c.fillRect(px-1*s,py-52*s,2*s,34*s);c.beginPath();c.ellipse(px,py-16*s,8*s,15*s,0,0,TAU);c.fill();c.fillRect(px-7*s,py-5*s,5*s,22*s);c.fillRect(px+2*s,py-5*s,5*s,22*s);
  c.strokeStyle=hsl(hue,100,75,.7);c.lineWidth=1.2*u;c.beginPath();c.arc(px,py-52*s,30*s,Math.PI,TAU);c.stroke();
  const mkd=n=>Array.from({length:Math.round(n)},()=>({x:Math.random()*W*1.2,y:Math.random()*H,l:(10+Math.random()*16)*u,v:.6+Math.random()*.5}));drops=mkd(70*D());drops2=mkd(40*D());rip=Array.from({length:10},()=>({x:Math.random()*W,y:H*(.74+Math.random()*.24),a:Math.random()}));tw=twinkles(12,r,.3)},
draw(t,dt){Z(.15);g.drawImage(base,0,0);
  Z(.45);g.globalCompositeOperation='lighter';for(const b of bokeh){g.globalAlpha=.5+.5*Math.sin(t/900+b.ph);g.drawImage(b.spr,b.x,b.y,b.s,b.s)}g.globalAlpha=1;g.globalCompositeOperation='source-over';
  Z(.85);g.drawImage(umb,0,0);Z(.6);
  g.strokeStyle='rgba(185,205,255,.45)';g.lineWidth=1.1*u;g.lineCap='round';
  for(const L of [[drops2,.7],[drops,1]]){g.globalAlpha=L[1]*.7;g.beginPath();for(const d of L[0]){d.y+=dt*d.v*(.9)*u*1.1;d.x-=dt*d.v*.22*u;if(d.y>H||d.x<-20){d.y=-d.l;d.x=Math.random()*W*1.2}g.moveTo(d.x,d.y);g.lineTo(d.x-d.l*.24,d.y+d.l)}g.stroke()}
  g.globalAlpha=1;g.strokeStyle='rgba(200,215,255,.5)';g.lineWidth=u;
  for(const p of rip){p.a+=dt*.0009;if(p.a>1){p.a=0;p.x=Math.random()*W;p.y=H*(.74+Math.random()*.24)}g.globalAlpha=(1-p.a)*.6;g.beginPath();g.ellipse(p.x,p.y,(4+p.a*22)*u,(1.2+p.a*6)*u,0,0,TAU);g.stroke()}
  g.globalAlpha=1;
  nextL-=dt;if(nextL<0){flash=.5;nextL=7000+Math.random()*9000}if(flash>.01){g.fillStyle=`rgba(190,200,255,${flash})`;g.fillRect(0,0,W,H*.7);flash*=Math.pow(.992,dt)}}}}

/* ───────── 6. Atardecer anime ───────── */
function sunset(){let sky,c1,c2,fg,birds,gS,sx,sy;
return{usesHue:0,
init(){const r=rng(13);sky=mk(W,H);let c=sky.getContext('2d');
  c.fillStyle=lg(c,0,0,0,H,[[0,'#150f45'],[.28,'#5e2a86'],[.52,'#c84b82'],[.72,'#ff8a5c'],[.88,'#ffc070'],[1,'#ffe3a0']]);c.fillRect(0,0,W,H);
  c.drawImage(starLayer(W,H*.4,Math.round(90*D()),r,1),0,0);
  sx=W*.3;sy=H*.7;c.fillStyle=rg(c,sx,sy,0,H*.7,[[0,'rgba(255,240,200,.95)'],[.08,'rgba(255,205,130,.7)'],[.3,'rgba(255,140,100,.25)'],[1,'rgba(255,100,100,0)']]);c.fillRect(0,0,W,H);
  c1=mk(W,H*.9);c=c1.getContext('2d');for(let i=0;i<9;i++)cloud(c,W,r()*W,H*(.12+r()*.45),W*(.35+r()*.35),H*(.07+r()*.05),[255,206,160],[170,84,120],r);
  c2=mk(W,H);c=c2.getContext('2d');for(let i=0;i<6;i++)cloud(c,W,r()*W,H*(.35+r()*.3),W*(.5+r()*.4),H*(.1+r()*.05),[255,150,130],[62,28,96],r);
  fg=mk(W,H);c=fg.getContext('2d');
  c.fillStyle='#1a0b2e';let x=0;while(x<W){const w=(10+r()*26)*u,h=(8+r()*40)*u;c.fillRect(x,H*.86-h,w,h+H);c.fillStyle='rgba(255,200,120,.7)';if(r()<.4)c.fillRect(x+2*u,H*.86-h+3*u,2*u,2*u);c.fillStyle='#1a0b2e';x+=w+1.5*u}
  c.fillRect(0,H*.88,W,H);
  // postes y cables
  c.fillStyle='#0d0618';c.strokeStyle='#0d0618';const poles=[[W*.12,H*.3],[W*.58,H*.36],[W*1.02,H*.28]];
  for(const p of poles){c.fillRect(p[0]-2.5*u,p[1],5*u,H);c.fillRect(p[0]-22*u,p[1]+10*u,44*u,3*u);c.fillRect(p[0]-16*u,p[1]+28*u,32*u,3*u)}
  c.lineWidth=1.3*u;for(let k=0;k<3;k++)for(let i=0;i<poles.length-1;i++){const a=poles[i],b=poles[i+1],ox=(k-1)*17*u,ya=a[1]+(k?28:10)*u+(k===0?0:0),yb=b[1]+(k?28:10)*u;c.beginPath();c.moveTo(a[0]+(k===1?0:(k-1)*20*u),ya);c.quadraticCurveTo((a[0]+b[0])/2,Math.max(ya,yb)+34*u,b[0]+(k===1?0:(k-1)*20*u),yb);c.stroke()}
  gS=glow(256,38,100,72,.8);birds=Array.from({length:Math.round(7*D()+2)},()=>({x:r()*W,y:H*(.2+r()*.3),s:(6+r()*8)*u,v:.01+r()*.02,p:r()*TAU}))},
draw(t,dt){Z(.02);g.drawImage(sky,0,0);addS(gS,sx-H*.4,sy-H*.4,H*.8,H*.8,.6+.25*Math.sin(t/1800));
  const o1=(t*.004)%W,o2=(t*.009)%W;Z(.12);g.drawImage(c1,-o1,0);g.drawImage(c1,W-o1,0);Z(.3);g.drawImage(c2,-o2,H*.04);g.drawImage(c2,W-o2,H*.04);Z(.55);
  g.strokeStyle='#1a0b2e';g.lineWidth=1.6*u;g.lineCap='round';g.beginPath();
  for(const b of birds){b.x+=b.v*dt*u;b.y+=Math.sin(t/900+b.p)*.01*dt*u;if(b.x>W+20)b.x=-20;const f=Math.sin(t/160+b.p)*b.s*.5;g.moveTo(b.x-b.s,b.y-f);g.quadraticCurveTo(b.x-b.s*.4,b.y-b.s*.2,b.x,b.y);g.quadraticCurveTo(b.x+b.s*.4,b.y-b.s*.2,b.x+b.s,b.y-f)}g.stroke();
  Z(.88);g.drawImage(fg,0,0)}}}

/* ───────── 7. Cielo de verano ───────── */
function summer(){let sky,c1,c2,fg,sd,gS;
return{usesHue:0,
init(){const r=rng(17);sky=mk(W,H);let c=sky.getContext('2d');
  c.fillStyle=lg(c,0,0,0,H,[[0,'#2a73d8'],[.45,'#5aa9f2'],[.8,'#b5e0ff'],[1,'#eaf7ff']]);c.fillRect(0,0,W,H);
  c.fillStyle=rg(c,W*.85,H*.08,0,W*.9,[[0,'rgba(255,255,235,.85)'],[.12,'rgba(255,248,210,.35)'],[1,'rgba(255,255,255,0)']]);c.fillRect(0,0,W,H);
  c1=mk(W,H);c=c1.getContext('2d');for(let i=0;i<8;i++)cloud(c,W,r()*W,H*(.15+r()*.4),W*(.35+r()*.3),H*(.06+r()*.04),[255,255,255],[150,185,235],r);
  c2=mk(W,H);c=c2.getContext('2d');for(let i=0;i<5;i++)cloud(c,W,r()*W,H*(.3+r()*.3),W*(.5+r()*.4),H*(.1+r()*.06),[255,255,255],[120,160,225],r);
  fg=mk(W,H*.4);c=fg.getContext('2d');const fh=H*.4;ridge(c,W,fh,fh*.35,fh*.14,3,1,lg(c,0,0,0,fh,[[0,'#58b552'],[1,'#1f6a3a']]),r);
  for(let i=0;i<900;i++){const x=r()*W,y=fh*(.3+r()*.7),l=(5+r()*14)*u;c.strokeStyle=r()<.5?'rgba(30,110,50,.7)':'rgba(120,200,90,.55)';c.lineWidth=1.2*u;c.beginPath();c.moveTo(x,y);c.lineTo(x+(r()-.5)*5*u,y-l);c.stroke()}
  for(let i=0;i<110;i++){const x=r()*W,y=fh*(.45+r()*.55),s=(1.5+r()*2.5)*u;c.fillStyle=['#fff','#ffd6e5','#fff3a0','#ffb0d0'][(r()*4)|0];c.beginPath();c.arc(x,y,s,0,TAU);c.fill()}
  gS=glow(256,50,100,90,.7);sd=mkPet(26*D(),r)},
draw(t,dt){Z(.02);g.drawImage(sky,0,0);addS(gS,W*.85-H*.35,H*.08-H*.35,H*.7,H*.7,.8+.2*Math.sin(t/2000));
  const o1=(t*.005)%W,o2=(t*.011)%W;Z(.1);g.drawImage(c1,-o1,0);g.drawImage(c1,W-o1,0);Z(.28);g.drawImage(c2,-o2,H*.02);g.drawImage(c2,W-o2,H*.02);Z(.6);
  g.fillStyle='rgba(255,255,255,.7)';for(const p of sd){p.y-=dt*.012*u;p.x+=(Math.sin(t/900+p.ph)*.02+.015)*dt*u;if(p.y<-10){p.y=H*(.5+Math.random()*.5);p.x=Math.random()*W}if(p.x>W+10)p.x=-10;g.globalAlpha=.4+.6*p.d;g.fillRect(p.x,p.y,2.2*u,2.2*u)}g.globalAlpha=1;
  {const a=par*ZA,s=par>0?1+2.1*a*.9+.006:1,k=Math.sin(t/1700)*.012;g.setTransform(s,0,k,s,W/2*(1-s)-PX*.9*a*W-k*H*.75,H/2*(1-s)-PY*.9*a*W*.6);g.drawImage(fg,-8*u,H*.62)}}}}

/* ───────── 8. Bosque espiritual ───────── */
function forest(){let base,mid,near,mi,rays,gS,gM,spirits,tw;
return{usesHue:1,
init(){const r=rng(23);base=mk(W,H);let c=base.getContext('2d');
  c.fillStyle=lg(c,0,0,0,H,[[0,'#020c10'],[.5,'#06302e'],[1,'#0b4a3c']]);c.fillRect(0,0,W,H);
  c.fillStyle=rg(c,W*.65,H*.05,0,W*.9,[[0,'rgba(150,230,210,.35)'],[.3,'rgba(60,160,150,.12)'],[1,'rgba(0,0,0,0)']]);c.fillRect(0,0,W,H);
  c.drawImage(starLayer(W,H*.5,Math.round(120*D()),r,1),0,0);
  const forestRow=(col,y,hmin,hmax,gap)=>{c.fillStyle=col;let x=-10;while(x<W+20){const h=(hmin+r()*(hmax-hmin))*u,w=h*.28;c.beginPath();c.moveTo(x,y-h);c.lineTo(x+w,y);c.lineTo(x-w,y);c.fill();c.fillRect(x-1.5*u,y-2,3*u,H);x+=gap*u*(.6+r()*.8)}};
  forestRow('#0a3a38',H*.7,80,170,18);
  mid=mk(W,H);c=mid.getContext('2d');forestRow('#052827',H*.82,110,240,26);
  near=mk(W,H);c=near.getContext('2d');
  for(const sx of [-.02,1.0]){const tx=W*sx,tw2=W*.22;c.fillStyle=lg(c,tx-tw2/2,0,tx+tw2/2,0,[[0,'#020a0a'],[.6,'#041615'],[1,'#020a0a']]);c.beginPath();c.moveTo(tx-tw2*.4,H);c.quadraticCurveTo(tx-tw2*.3,H*.5,tx-tw2*.22,0);c.lineTo(tx+tw2*.22,0);c.quadraticCurveTo(tx+tw2*.3,H*.5,tx+tw2*.4,H);c.fill()}
  c.fillStyle='#021010';for(let i=0;i<60;i++){const x=r()*W,h=(14+r()*40)*u;c.beginPath();c.moveTo(x,H);c.quadraticCurveTo(x+(r()-.5)*20*u,H-h*.6,x+(r()-.5)*30*u,H-h);c.lineTo(x+4*u,H);c.fill()}
  // hongos luminosos
  for(let i=0;i<7;i++){const x=W*(.2+r()*.6),y=H*(.93+r()*.05),s=(5+r()*8)*u;c.fillStyle=hsl(hue+10,90,68,.95);c.beginPath();c.ellipse(x,y,s,s*.6,0,Math.PI,TAU);c.fill();c.fillRect(x-s*.12,y,s*.24,s*.7)}
  rays=mk(W,H);c=rays.getContext('2d');for(let i=0;i<5;i++){const x0=W*(.45+i*.12),w=W*(.06+r()*.05);c.fillStyle=lg(c,0,0,0,H*.9,[[0,'rgba(170,240,225,.28)'],[1,'rgba(170,240,225,0)']]);c.beginPath();c.moveTo(x0,0);c.lineTo(x0+w,0);c.lineTo(x0+w*3-W*.35,H*.9);c.lineTo(x0-w*2-W*.35,H*.9);c.closePath();c.fill()}
  mi=mist(W*1.6,H*.22,.16);gS=glow(64,hue,90,72,.9);gM=glow(64,hue+10,90,65,.8);
  spirits=Array.from({length:Math.round(34*D())},()=>({x:r()*W,y:r()*H,s:(8+r()*22)*u,v:.006+r()*.014,ph:r()*TAU,h:r()<.5?0:1}));tw=twinkles(14,r,.4)},
draw(t,dt){Z(.04);g.drawImage(base,0,0);drawTw(tw,t);
  Z(.2);g.globalCompositeOperation='lighter';g.globalAlpha=.55+.45*Math.sin(t/2600);g.drawImage(rays,0,0);g.globalAlpha=1;g.globalCompositeOperation='source-over';
  Z(.34);g.globalAlpha=.9;g.drawImage(mi,-W*.3+Math.sin(t/8000)*W*.1,H*.55);g.globalAlpha=1;Z(.5);g.drawImage(mid,0,0);Z(.68);g.globalAlpha=.8;g.drawImage(mi,-W*.5+Math.cos(t/9000)*W*.14,H*.74);g.globalAlpha=1;Z(.92);g.drawImage(near,0,0);Z(.7);
  g.globalCompositeOperation='lighter';
  for(const s of spirits){s.y-=s.v*dt*u;s.x+=Math.sin(t/1300+s.ph)*.03*dt*u;if(s.y<-30){s.y=H+20;s.x=Math.random()*W}g.globalAlpha=.35+.65*(.5+.5*Math.sin(t/700+s.ph*2));g.drawImage(s.h?gS:gM,s.x,s.y,s.s,s.s)}
  g.globalAlpha=1;g.globalCompositeOperation='source-over'}}}

/* ───────── 9. Vía Láctea ───────── */
function milky(){let sky,fg,gF,tw,sparks=[],cx,cy,diag;
return{usesHue:0,
init(){const r=rng(31);diag=Math.hypot(W,H)*1.05;sky=mk(diag,diag);let c=sky.getContext('2d');
  c.fillStyle=lg(c,0,0,0,diag,[[0,'#050818'],[.5,'#0c1038'],[1,'#1b1650']]);c.fillRect(0,0,diag,diag);
  c.save();c.translate(diag/2,diag/2);c.rotate(-.62);
  for(const b of [[-.3,0,.35,'rgba(120,90,230,.16)'],[.1,.02,.3,'rgba(255,120,170,.1)'],[.35,-.01,.28,'rgba(70,170,255,.12)'],[-.05,.01,.2,'rgba(255,220,200,.1)']]){c.fillStyle=rg(c,b[0]*diag,b[1]*diag,0,b[2]*diag,[[0,b[3]],[1,'rgba(0,0,0,0)']]);c.fillRect(-diag,-diag,diag*2,diag*2)}
  const n=Math.round(5200*D());for(let i=0;i<n;i++){const x=(r()-.5)*diag,v=(r()+r()+r()-1.5)*diag*.11,a=(.15+r()*.7)*Math.max(.1,1-Math.abs(v)/(diag*.14)),s=(r()<.03?1.8:.8)*u;c.fillStyle=`rgba(${220+r()*35|0},${215+r()*40|0},255,${a})`;c.fillRect(x,v,s,s)}
  c.fillStyle='rgba(5,6,20,.28)';for(let i=0;i<10;i++){c.beginPath();c.ellipse((r()-.5)*diag*.8,(r()-.5)*diag*.05,diag*(.04+r()*.07),diag*(.006+r()*.012),0,0,TAU);c.fill()}
  c.restore();c.drawImage(starLayer(diag,diag,Math.round(260*D()),r,1),0,0);
  fg=mk(W,H);c=fg.getContext('2d');ridge(c,W,H,H*.9,H*.045,4,1,'#05071a',r);
  c.fillStyle='#03040f';for(let i=0;i<40;i++){const x=r()<.6?r()*W*.38:W*.62+r()*W*.38,h=(20+r()*60)*u,w=h*.28,y=H*.93;c.beginPath();c.moveTo(x,y-h);c.lineTo(x+w,y);c.lineTo(x-w,y);c.fill()}
  c.fillRect(0,H*.93,W,H);cx=W*.46;cy=H*.915;const tw3=36*u;
  c.fillStyle='#0a0c20';c.beginPath();c.moveTo(cx,cy-tw3*.9);c.lineTo(cx+tw3,cy);c.lineTo(cx-tw3,cy);c.fill();
  c.fillStyle='rgba(255,170,80,.9)';c.beginPath();c.moveTo(cx,cy-tw3*.5);c.lineTo(cx+tw3*.3,cy);c.lineTo(cx-tw3*.3,cy);c.fill();
  gF=glow(128,32,100,62,.8);tw=twinkles(34*D(),r,.8)},
draw(t,dt){Z(.04);g.save();g.translate(W/2,H*.4);g.rotate(t*.000012);g.drawImage(sky,-diag/2,-diag/2);g.restore();Z(.08);drawTw(tw,t);shootStars(dt,.22);
  Z(.75);g.drawImage(fg,0,0);addS(gF,cx-60*u,cy-52*u,120*u,100*u,.75+.25*Math.sin(t/120)*Math.sin(t/330));
  if(Math.random()<.04*dt/16)sparks.push({x:cx+(Math.random()-.5)*14*u,y:cy-2*u,l:0});g.fillStyle='rgba(255,190,100,.9)';
  for(let i=sparks.length-1;i>=0;i--){const s=sparks[i];s.l+=dt;s.y-=.04*dt*u;s.x+=Math.sin(s.l/200)*.02*dt*u;if(s.l>1400){sparks.splice(i,1);continue}g.globalAlpha=1-s.l/1400;g.fillRect(s.x,s.y,1.8*u,1.8*u)}g.globalAlpha=1}}}

/* ───────── 10. Mar de noche ───────── */
function sea(){let base,hz,tw,beam,cols,mx,my,mr,dash;
return{usesHue:0,
init(){const r=rng(41);hz=H*.52;base=mk(W,H);let c=base.getContext('2d');
  c.fillStyle=lg(c,0,0,0,hz,[[0,'#030a22'],[.6,'#0b2352'],[1,'#27497c']]);c.fillRect(0,0,W,hz);c.drawImage(starLayer(W,hz,Math.round(240*D()),r,1),0,0);
  mx=W*.68;my=H*.2;mr=Math.min(W,H)*.075;c.fillStyle=rg(c,mx,my,mr*.6,mr*7,[[0,'rgba(200,220,255,.55)'],[.25,'rgba(120,160,255,.15)'],[1,'rgba(0,0,0,0)']]);c.fillRect(0,0,W,hz);
  c.fillStyle=rg(c,mx-mr*.3,my-mr*.3,mr*.1,mr,[[0,'#fff'],[1,'#b8c8f5']]);c.beginPath();c.arc(mx,my,mr,0,TAU);c.fill();
  // isla y faro
  c.fillStyle='#050b1c';c.beginPath();c.moveTo(W*.02,hz+2);c.quadraticCurveTo(W*.1,hz-H*.08,W*.24,hz-H*.03);c.quadraticCurveTo(W*.3,hz-H*.015,W*.34,hz+2);c.fill();
  const fx=W*.14,fy=hz-H*.07;c.fillStyle='#0a1330';c.beginPath();c.moveTo(fx-5*u,fy);c.lineTo(fx+5*u,fy);c.lineTo(fx+3.4*u,fy-34*u);c.lineTo(fx-3.4*u,fy-34*u);c.fill();c.fillRect(fx-5*u,fy-39*u,10*u,5*u);c.fillStyle='rgba(255,235,170,.95)';c.fillRect(fx-3*u,fy-44*u,6*u,5*u);
  beam={x:fx,y:fy-41*u};
  cols=['#16396b','#12315c','#0e284d','#0b2041','#081835','#061029','#040a1c'];
  dash=Array.from({length:Math.round(34*D())},(_,i)=>({y:hz+(i+1)*(H-hz)/36,w:(10+i*1.6)*u*(.5+r()*.9),o:(r()-.5)*(10+i*1.4)*u,ph:r()*TAU}));tw=twinkles(24*D(),r,.8)},
draw(t,dt){Z(.05);g.drawImage(base,0,0);drawTw(tw,t);shootStars(dt,.06);Z(.35);
  const ang=t/2600,ba=Math.max(0,Math.cos(ang))*.55,dir=Math.cos(ang)>0?1:-1;
  if(ba>.02){g.globalCompositeOperation='lighter';g.fillStyle=lg(g,beam.x,0,beam.x+dir*W*.9,0,[[0,`rgba(255,240,190,${ba})`],[1,'rgba(255,240,190,0)']]);const sp=H*.03*(1-Math.abs(Math.sin(ang))*.6);g.beginPath();g.moveTo(beam.x,beam.y);g.lineTo(beam.x+dir*W,beam.y-sp*4-H*.05);g.lineTo(beam.x+dir*W,beam.y+sp*4-H*.05);g.fill();g.globalCompositeOperation='source-over'}
  const n=cols.length,hh=H-hz;
  for(let i=0;i<n;i++){const by=hz+hh*(i/n)*(i/n*.5+.5)+4*u,a=(2+i*2.4)*u,f=.012-i*.0009,s=t*(.0009+i*.00018)*(i%2?1:-1);
    g.fillStyle=cols[i];g.beginPath();g.moveTo(0,H);for(let x=0;x<=W+14*u;x+=14*u)g.lineTo(x,by+a*Math.sin(x*f/u+s)+a*.4*Math.sin(x*f*2.3/u-s*1.3));g.lineTo(W,H);g.closePath();g.fill();
    if(i===1||i===3){g.strokeStyle='rgba(180,210,255,.07)';g.lineWidth=u;g.stroke()}}
  g.fillStyle='rgba(215,230,255,.55)';for(const d of dash){g.globalAlpha=.35+.55*Math.sin(t/500+d.ph)**2;g.fillRect(mx+d.o-d.w/2,d.y,d.w,1.6*u)}g.globalAlpha=1}}}

/* ───────── 11. Mínimo ───────── */
function minimal(){let base,orbs;return{usesHue:1,
init(){const r=rng(2);base=mk(W,H);let c=base.getContext('2d');c.fillStyle='#070a18';c.fillRect(0,0,W,H);c.drawImage(starLayer(W,H,Math.round(140*D()),r,1),0,0);
  orbs=[0,1,2].map(i=>({spr:glow(256,hue+i*55,80,48,.4),x:r(),y:r(),p:r()*TAU,s:Math.max(W,H)*(.7+i*.15)}))},
draw(t){Z(.05);g.drawImage(base,0,0);let i=0;for(const o of orbs){Z(.12+.22*i++);addS(o.spr,W*o.x-o.s/2+Math.sin(t/7000+o.p)*W*.1,H*o.y-o.s/2+Math.cos(t/9000+o.p)*H*.08,o.s,o.s,1)}}}}

/* ───────── 12. Imagen propia ───────── */
function custom(){let pet,spr,vig;return{usesHue:1,
init(){const r=rng(5);spr=petalSpr(hue);pet=mkPet(34*D(),r);vig=mk(W,H);const c=vig.getContext('2d');c.fillStyle=rg(c,W/2,H/2,Math.min(W,H)*.3,Math.max(W,H)*.75,[[0,'rgba(0,0,0,0)'],[1,'rgba(0,0,10,.55)']]);c.fillRect(0,0,W,H)},
draw(t,dt){if(!bmp){g.fillStyle='#070a18';g.fillRect(0,0,W,H);return}
  const iw=bmp.width,ih=bmp.height,k=Math.max(W/iw,H/ih)*(1.07+.02*Math.sin(t/9000));
  Z(.3);g.drawImage(bmp,(W-iw*k)/2+Math.sin(t/7000)*W*.012,(H-ih*k)/2+Math.cos(t/9000)*H*.01,iw*k,ih*k);g.setTransform(1,0,0,1,0,0);g.drawImage(vig,0,0);if(cpet)drawPet(pet,spr,t,dt)}}}



/* ───────── Gargantúa (WebGL) con respaldo 2D ───────── */
function hole(){
  if(!GLX.try())return holeFB();
  const NSV=[118,92,66],GK=[1,.78,.58];
  return{usesHue:1,gl:true,
    init(){GLX.size(GK[lv])},
    draw(t){GLX.draw(t,{hue,px:PX,py:PY,par,dn:Math.min(1.35,.75+.25*dens),ns:NSV[lv]})}}}

/* bokeh de primer plano (cada escena con su tono) */
const FBC={sakura:[null,90,82,.2],forest:[165,80,70,.18],summer:[52,100,90,.2],sunset:[30,100,72,.18],aurora:[170,90,70,.14],neon:[300,100,66,.16],rain:[200,60,76,.14],sea:[210,70,76,.12],stars:[220,60,80,.1]};
function mkFB(){const c=FBC[sid];fb=null;if(!c||!anim&&false)return;const r=rng(99),n=Math.round(5*dens*PART[lv]);if(!n)return;
  fb={spr:glow(96,c[0]===null?hue:c[0],c[1],c[2],1),a:c[3],p:Array.from({length:n},()=>({x:r()*W,y:r()*H,s:(60+r()*120)*u,v:.004+r()*.01,ph:r()*TAU,k:.6+r()*.8}))}}
function drawFB(t,dt){if(!fb)return;g.globalCompositeOperation='lighter';const o=ofs(1.7);
  for(const p of fb.p){p.y-=p.v*dt*u*.6;p.x+=Math.sin(t/3000+p.ph)*.01*dt*u;if(p.y<-p.s){p.y=H+p.s;p.x=Math.random()*W}
    g.globalAlpha=fb.a*(.5+.5*Math.sin(t/2300+p.ph))*p.k;g.drawImage(fb.spr,p.x+o[0]*p.k-p.s/2,p.y+o[1]*p.k-p.s/2,p.s,p.s)}
  g.globalAlpha=1;g.globalCompositeOperation='source-over'}

const SCENES={sakura,hole,aurora,neon,rain,sunset,summer,forest,stars:milky,sea,min:minimal,custom};

/* ───────── control ───────── */
function resizeNow(){const dpr=Math.min(devicePixelRatio||1,1.5),k=KS[lv]*dpr;
  W=cv.width=Math.max(2,Math.round(innerWidth*k));H=cv.height=Math.max(2,Math.round(innerHeight*k));u=W/390;lastW=innerWidth;lastH=innerHeight;cap=CAP[lv];build()}
function build(){sc=(SCENES[sid]||sakura)();shoot=[];GLX.show(false);g.setTransform(1,0,0,1,0,0);sc.init();if(sc.gl)GLX.show(true);mkFB();paint()}
function frame(t,dt){if(sc.gl){sc.draw(t,dt);return}sc.draw(t,dt);drawFB(t,dt);g.setTransform(1,0,0,1,0,0)}
function paint(){if(!anim||document.hidden){if(sc)frame(T,0)}}
function schedule(ms=140){clearTimeout(rb);rb=setTimeout(()=>{build();restart()},ms)}
function parStep(el,now){const q=now-lastIn>2600;if(q){tx*=Math.pow(.9992,el);ty*=Math.pow(.9992,el)}
  const ix=idle*Math.sin(T/6400)*.55,iy=idle*Math.cos(T/8700)*.32,k=1-Math.exp(-el/230);
  PX+=(Math.max(-1,Math.min(1,tx+ix))-PX)*k;PY+=(Math.max(-1,Math.min(1,ty+iy))-PY)*k}
function loop(ts){raf=requestAnimationFrame(loop);const el=ts-last;if(el<1000/cap-3)return;last=ts;if(el>200)return;
  parStep(Math.min(el,60),ts);const dt=Math.min(50,el)*speed;T+=dt;frame(T,dt);fsum+=el;fn++;
  if(fn>=45){const avg=fsum/fn;fps=Math.round(1000/avg);fsum=fn=0;if(qual==='auto'&&lv<2&&avg>(cap===60?23:40)){lv++;resizeNow()}}}
function restart(){cancelAnimationFrame(raf);raf=0;last=0;if(anim&&!document.hidden&&sc)raf=requestAnimationFrame(loop);else paint()}
addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>{if(innerWidth!==lastW||Math.abs(innerHeight-lastH)>140){resizeNow();restart()}},180)});
document.addEventListener('visibilitychange',restart);
return{
  init(o){set(o,true)},
  set,setScene(id){sid=id;build();restart()},
  setCustom(b){bmp=b;if(sid==='custom'){build();restart()}},
  setPointer(x,y){tx=Math.max(-1,Math.min(1,x));ty=Math.max(-1,Math.min(1,y));lastIn=performance.now()},
  stats(){return{fps,lv,scale:KS[lv],gl:!!(sc&&sc.gl)}},
  get running(){return !!raf}
};
function set(o,first){first=first||!sc;
  if('hue' in o&&o.hue!==hue){hue=o.hue;if(!first&&sc&&sc.usesHue&&!sc.gl)schedule(180)}
  if('density' in o&&o.density!==dens){dens=o.density;if(!first&&sc&&!sc.gl)schedule(220)}
  if('speed' in o)speed=o.speed;
  if('par' in o)par=o.par;
  if('idle' in o)idle=o.idle;
  if('cpet' in o)cpet=o.cpet;
  if('anim' in o&&o.anim!==anim){anim=o.anim;if(!first)restart()}
  if('quality' in o&&o.quality!==qual){qual=o.quality;lv=qual==='low'?2:qual==='mid'?1:0;if(!first){resizeNow();restart()}else if(qual==='auto'&&((navigator.deviceMemory||8)<=3||(navigator.hardwareConcurrency||8)<=4))lv=1}
  if('scene' in o&&o.scene!==sid){sid=o.scene;if(!first){build();restart()}}
  if(first){resizeNow();restart()}
}
})();
