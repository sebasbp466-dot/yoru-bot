#!/data/data/com.termux/files/usr/bin/bash
# Desinstala Yoru con root.   bash termux/uninstall.sh [--conservar-datos]
PKG=com.yoru.bot
if [ "$1" = "--conservar-datos" ]; then su -c "pm uninstall -k $PKG"; else su -c "pm uninstall $PKG"; fi
su -c "dumpsys deviceidle whitelist -$PKG" >/dev/null 2>&1
echo "🗑️  Listo."
