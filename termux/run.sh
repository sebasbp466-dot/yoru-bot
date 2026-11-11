#!/data/data/com.termux/files/usr/bin/bash
# Alternativa SIN APK: corre el bot directo en Termux (más estable que dentro de la app).   bash termux/run.sh
cd "$(dirname "$0")/.."
termux-wake-lock 2>/dev/null
[ -d node_modules ] || npm install --omit=dev --no-audit --no-fund
mkdir -p data; [ -f data/config.json ] || cp config.example.json data/config.json
echo "Edita data/config.json (owners, geminiKeys, menuUrl) y vuelve a ejecutar si es la primera vez."
export YORU_DATA="$PWD/data"
exec node src/index.js
