'use strict';
/** Envía el botón "Abrir menú" (CTA URL). Si algo falla, manda el enlace como texto. */
async function sendMenu(sock, jid, quoted, cfg, extraText) {
  const url = cfg.menuUrl, name = cfg.botName;
  const body = extraText || `✦ *${name}* — menú interactivo\nToca el botón para abrir comandos, IA, juegos y ajustes.`;
  if (!url) return sock.sendMessage(jid, { text: '⚠️ Aún no hay `menuUrl` configurada.' }, { quoted });
  if (cfg.menuMode === 'text') return sock.sendMessage(jid, { text: `${body}\n\n${url}` }, { quoted });
  try {
    const content = { viewOnceMessage: { message: { messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
      interactiveMessage: { header: { title: name, hasMediaAttachment: false }, body: { text: body }, footer: { text: 'Yoru · menú web' },
        nativeFlowMessage: { buttons: [{ name: 'cta_url', buttonParamsJson: JSON.stringify({ display_text: 'Abrir menú', url, merchant_url: url }) }], messageParamsJson: '' } } } } };
    await sock.relayMessage(jid, content, {});
  } catch (e) {
    await sock.sendMessage(jid, { text: `${body}\n\n${url}` }, { quoted });
  }
}
module.exports = { sendMenu };
