#!/data/data/com.termux/files/usr/bin/bash
# Cópialo a ~/.termux/boot/ (con la app Termux:Boot) para que el bot arranque con el teléfono.
termux-wake-lock
cd "$HOME/yoru-bot" && nohup bash termux/run.sh > "$HOME/yoru.log" 2>&1 &
