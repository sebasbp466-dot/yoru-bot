'use strict';
const { jidNum } = require('./util');
const fill = (t, o) => t.replace(/@user/g, o.user).replace(/@grupo/g, o.group).replace(/@n/g, o.n);
async function onParticipants(sock, db, ev) {
  const g = db.group(ev.id); if (!g.welcome && !g.bye) return;
  let meta; try { meta = await sock.groupMetadata(ev.id); } catch { return; }
  for (const p of ev.participants) {
    const id = typeof p === 'string' ? p : p.id, tag = '@' + jidNum(id);
    if (ev.action === 'add' && g.welcome) await sock.sendMessage(ev.id, { text: fill(g.wmsg, { user: tag, group: meta.subject, n: String(meta.participants.length) }), mentions: [id] });
    if (ev.action === 'remove' && g.bye) await sock.sendMessage(ev.id, { text: fill(g.bmsg, { user: tag, group: meta.subject, n: String(meta.participants.length) }), mentions: [id] });
  }
}
module.exports = { onParticipants, fill };
