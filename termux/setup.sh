#!/data/data/com.termux/files/usr/bin/bash
# Prepara Termux para compilar y ejecutar Yoru. Ejecuta una sola vez:  bash termux/setup.sh
set -e
termux-setup-storage || true
pkg update -y && pkg upgrade -y
pkg install -y git nodejs-lts openjdk-21 gradle aapt2 apksigner zipalign python curl tsu termux-api || pkg install -y git nodejs openjdk-21 gradle aapt2 apksigner python curl tsu
echo "Node: $(node -v)  Java: $(java -version 2>&1 | head -1)"
[ "$(node -p 'process.versions.node.split(".")[0]')" -ge 22 ] || echo "⚠️  Capacitor 8 pide Node 22+. Si es menor, usa 'pkg install nodejs' (versión actual)."
if [ -z "$ANDROID_HOME" ]; then
  echo "⚠️  Falta el Android SDK (platform-tools, build-tools, platforms;android-36). En Termux no hay paquete oficial."
  echo "   Instálalo con un instalador de la comunidad (busca 'termux android sdk installer') y exporta ANDROID_HOME."
fi
echo "Listo. Siguiente: bash termux/build-apk.sh"
