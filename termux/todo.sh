#!/data/data/com.termux/files/usr/bin/bash
cd "$(dirname "$0")/.." || exit 1
ROOT=$PWD; export YORU_DATA="$ROOT/data"; mkdir -p data
say(){ printf '\n\033[1;35m✦ %s\033[0m\n' "$*"; }
if [ "$1" = apk ]; then exec bash termux/install.sh; fi
if ! command -v node >/dev/null || ! command -v git >/dev/null; then say "Instalando Node y Git…"; pkg update -y && pkg install -y nodejs-lts git || pkg install -y nodejs git || exit 1; fi
if [ ! -d node_modules/@whiskeysockets/baileys ]; then say "Instalando dependencias (1-3 min)…"; npm install --omit=dev --no-audit --no-fund --allow-git=all || { echo "❌ Falló npm install"; exit 1; }; fi
need_cfg=0; [ "$1" = config ] && need_cfg=1
node -e 'try{const c=require("./data/config.json");process.exit(c.owners&&c.owners.length&&c.geminiKeys&&c.geminiKeys.some(k=>k&&!/PEGA_AQUI/.test(k))?0:1)}catch(e){process.exit(1)}' || need_cfg=1
if [ $need_cfg = 1 ]; then
  say "Configuración (solo números, sin + ni espacios)"
  read -rp "Tu número (owner), ej. 584121234567: " OWN
  read -rp "Número de WhatsApp del bot (Enter = el mismo): " BOT; BOT=${BOT:-$OWN}
  read -rp "API key de Gemini (aistudio.google.com/apikey): " KEY
  read -rp "Enlace del menú en GitHub Pages (Enter para saltar): " MENU
  OWN="$OWN" BOT="$BOT" KEY="$KEY" MENU="$MENU" node -e '
    const fs=require("fs"),f="data/config.json";let c={};try{c=JSON.parse(fs.readFileSync(f))}catch{try{c=JSON.parse(fs.readFileSync("config.example.json"))}catch{}}
    const d=s=>String(s||"").replace(/\D/g,"");
    c.owners=[d(process.env.OWN)];c.pairingNumber=d(process.env.BOT);c.geminiKeys=[process.env.KEY.trim()].filter(Boolean);
    if(process.env.MENU.trim())c.menuUrl=process.env.MENU.trim();
    if(!c.apiToken||/cambia/.test(c.apiToken))c.apiToken=require("crypto").randomBytes(12).toString("hex");
    fs.writeFileSync(f,JSON.stringify(c,null,2));console.log("✅ Guardado en data/config.json")'
fi
termux-wake-lock 2>/dev/null
say "Arrancando Yoru. Saldrá un código de vinculación (WhatsApp → Dispositivos vinculados → Vincular con número). Detener: CTRL+C"
while true; do node src/index.js; echo "⚠️ El bot se detuvo, reiniciando en 5 s… (CTRL+C para salir)"; sleep 5; done
