const { getPool } = require('../config/db');

function genNotifId() {
  return 'NOTIF-' + Date.now().toString(36).toUpperCase().slice(-5) + Math.floor(Math.random() * 900 + 100);
}

async function create(userId, type, text, link) {
  const id = genNotifId();
  await getPool().query(
    'INSERT INTO notifications (id, user_id, type, text, link) VALUES (?, ?, ?, ?, ?)',
    [id, userId, type, text, link || null]
  );
  return { id, userId, type, text, link };
}

async function forUser(userId, limit = 50) {
  const [rows] = await getPool().query(
    'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
    [userId, limit]
  );
  return rows;
}

async function markAllRead(userId) {
  await getPool().query('UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0', [userId]);
}

async function markOneRead(id, userId) {
  await getPool().query('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [id, userId]);
}

async function unreadCount(userId) {
  const [[{ c }]] = await getPool().query(
    'SELECT COUNT(*) c FROM notifications WHERE user_id = ? AND is_read = 0',
    [userId]
  );
  return c;
}

module.exports = { create, forUser, markAllRead, markOneRead, unreadCount };
