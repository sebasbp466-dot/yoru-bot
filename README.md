# Yoru · bot de WhatsApp con IA

Bot (Node + Baileys) con Gemini (modelos `flash`/`pro`/`lite`/`auto` con respaldo automático), menú web interactivo y una app Android que **corre el bot** y lo **monitorea**.

```
src/            motor del bot (core/ = conexión, IA, permisos · commands/ = comandos)
menu/src/       el menú web (fuente única). `npm run menu` → docs/index.html
android/        app Capacitor (www/ = pantalla de monitoreo; el bot se copia en www/nodejs al compilar)
.github/        pages.yml (publica el menú) · apk.yml (compila el APK)
test/           node --test
```

## Puesta en marcha (una vez)
1. Crea un repo en GitHub (p. ej. `yoru-bot`) y sube todo esto a la rama `main`.
2. **Settings → Pages → Source: GitHub Actions.** Al subir cambios en `menu/` se publica en `https://TU-USUARIO.github.io/yoru-bot/`.
3. **Actions → "Compilar APK" → Run workflow.** Al terminar, descarga `yoru.apk` de *Artifacts* e instálalo (permite "instalar apps desconocidas").
4. Abre la app → pestaña **Ajustes**: tu número (owner), tu API key gratuita de Gemini ([aistudio.google.com](https://aistudio.google.com/apikey)), el enlace del menú → *Guardar*.
5. En **Estado** aparece un código de 8 caracteres: WhatsApp → Dispositivos vinculados → *Vincular con número de teléfono*.
6. Escribe `/menu` en WhatsApp.

En el móvil: desactiva el ahorro de batería para Yoru, o Android puede dormir el bot.

## Flujo de trabajo del menú
Edita `menu/src/*` → `npm run menu` (genera `docs/index.html` y `src/core/planned.json`) → sube a GitHub. El botón de WhatsApp abre siempre la última versión publicada.

## Desarrollo en PC / Termux
`npm install && cp config.example.json data/config.json && npm start` · `npm test` · `npm run estado`.

## Comandos
Los comandos del menú que aún no tienen código responden "en construcción" (se ven en `/ayuda` como pendientes). Para añadir uno, crea un objeto en `src/commands/*.js` con `{cat, name, alias, perm, cd, run(ctx)}`; el menú ya lo lista.

## Desde Termux (con root)
```
bash termux/setup.sh        # paquetes (una vez)
bash termux/build-apk.sh    # compila → ~/yoru.apk
bash termux/install.sh      # instala/actualiza con su + quita restricciones de batería
bash termux/uninstall.sh    # desinstala con su (--conservar-datos para mantener la sesión)
bash termux/run.sh          # alternativa sin APK: el bot directo en Termux
```
Compilar Android en Termux es delicado (necesita el Android SDK instalado a mano y el aapt2 de Termux). Si falla, usa GitHub Actions para compilar y `install.sh ruta/al/apk` para instalar con root.
