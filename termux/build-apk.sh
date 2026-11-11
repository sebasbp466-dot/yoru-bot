#!/data/data/com.termux/files/usr/bin/bash
# Compila el APK dentro de Termux → ~/yoru.apk   (usa:  bash termux/build-apk.sh)
set -e
cd "$(dirname "$0")/.."; ROOT=$(pwd)
: "${ANDROID_HOME:?Define ANDROID_HOME (carpeta del Android SDK). Mira termux/setup.sh}"
export ANDROID_SDK_ROOT=$ANDROID_HOME
npm install --no-audit --no-fund
npm test
node scripts/build-menu.js
node scripts/prepare-android.js
cd android
npm install --no-audit --no-fund
[ -d android ] || npx cap add android
python3 - <<'PY'
p='android/app/src/main/AndroidManifest.xml'; s=open(p).read()
add=''.join('<uses-permission android:name="android.permission.%s" />\n    '%x for x in ['WAKE_LOCK','FOREGROUND_SERVICE','POST_NOTIFICATIONS','REQUEST_IGNORE_BATTERY_OPTIMIZATIONS'] if x not in s)
open(p,'w').write(s.replace('<application',add+'<application',1))
PY
npx cap sync android
cd android
# Gradle trae un aapt2 para x86; en Termux hay que usar el del sistema
grep -q aapt2FromMavenOverride gradle.properties 2>/dev/null || echo "android.aapt2FromMavenOverride=$PREFIX/bin/aapt2" >> gradle.properties
echo "sdk.dir=$ANDROID_HOME" > local.properties
gradle assembleDebug --no-daemon -Dorg.gradle.jvmargs=-Xmx1536m
cp app/build/outputs/apk/debug/app-debug.apk "$HOME/yoru.apk"
echo "✅ APK listo: $HOME/yoru.apk  →  bash termux/install.sh"
