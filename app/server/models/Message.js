const { getPool } = require('../config/db');

function genMsgId() {
  return 'MSG-' + Date.now().toString(36).toUpperCase().slice(-5) + Math.floor(Math.random() * 900 + 100);
}

async function send(fromId, toId, body) {
  const id = genMsgId();
  await getPool().query(
    'INSERT INTO messages (id, from_user_id, to_user_id, body) VALUES (?, ?, ?, ?)',
    [id, fromId, toId, body]
  );
  const [rows] = await getPool().query('SELECT * FROM messages WHERE id = ?', [id]);
  return rows[0];
}

async function conversation(userId, otherId) {
  const [rows] = await getPool().query(
    `SELECT * FROM messages
     WHERE (from_user_id = ? AND to_user_id = ?) OR (from_user_id = ? AND to_user_id = ?)
     ORDER BY created_at ASC`,
    [userId, otherId, otherId, userId]
  );
  return rows;
}

async function markThreadRead(userId, otherId) {
  await getPool().query(
    'UPDATE messages SET is_read = 1 WHERE to_user_id = ? AND from_user_id = ? AND is_read = 0',
    [userId, otherId]
  );
}

async function inboxThreads(userId) {
  const [rows] = await getPool().query(
    `SELECT m.*, u.username, u.first_name, u.avatar_url
     FROM messages m
     JOIN users u ON u.id = IF(m.from_user_id = ?, m.to_user_id, m.from_user_id)
     WHERE m.from_user_id = ? OR m.to_user_id = ?
     ORDER BY m.created_at DESC`,
    [userId, userId, userId]
  );

  const byOther = new Map();
  for (const m of rows) {
    const otherId = m.from_user_id === userId ? m.to_user_id : m.from_user_id;
    if (!byOther.has(otherId)) {
      byOther.set(otherId, {
        otherId,
        username: m.username,
        firstName: m.first_name,
        avatar: m.avatar_url,
        lastText: m.body,
        lastAt: m.created_at,
        unread: 0,
      });
    }
    if (m.to_user_id === userId && !m.is_read) {
      byOther.get(otherId).unread += 1;
    }
  }
  return Array.from(byOther.values());
}

async function unreadCount(userId) {
  const [[{ c }]] = await getPool().query(
    'SELECT COUNT(*) c FROM messages WHERE to_user_id = ? AND is_read = 0',
    [userId]
  );
  return c;
}

module.exports = { send, conversation, markThreadRead, inboxThreads, unreadCount };
