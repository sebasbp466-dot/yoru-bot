#!/data/data/com.termux/files/usr/bin/bash
# Instala (o actualiza) el APK con root y lo deja sin restricciones de batería.   bash termux/install.sh [ruta.apk]
APK=${1:-$HOME/yoru.apk}; PKG=com.yoru.bot
[ -f "$APK" ] || { echo "No existe $APK. Primero: bash termux/build-apk.sh"; exit 1; }
cp "$APK" /sdcard/yoru.apk 2>/dev/null
su -c "cp '$APK' /data/local/tmp/yoru.apk && chmod 644 /data/local/tmp/yoru.apk && pm install -r -d /data/local/tmp/yoru.apk && rm /data/local/tmp/yoru.apk" || { echo "❌ Falló la instalación (¿concediste root a Termux?)"; exit 1; }
su -c "dumpsys deviceidle whitelist +$PKG; cmd appops set $PKG RUN_IN_BACKGROUND allow; cmd appops set $PKG RUN_ANY_IN_BACKGROUND allow; pm grant $PKG android.permission.POST_NOTIFICATIONS" >/dev/null 2>&1
su -c "monkey -p $PKG -c android.intent.category.LAUNCHER 1" >/dev/null 2>&1
echo "✅ Yoru instalada y abierta. Batería: sin restricciones."
