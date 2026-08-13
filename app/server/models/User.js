const { getPool } = require('../config/db');

async function findByEmailOrUsername(identifier) {
  const [rows] = await getPool().query(
    'SELECT * FROM users WHERE email = ? OR username = ? LIMIT 1',
    [identifier, identifier]
  );
  return rows[0] || null;
}

async function findById(id) {
  const [rows] = await getPool().query('SELECT * FROM users WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

async function create({ username, email, passwordHash, firstName, lastName, phone, country }) {
  const [result] = await getPool().query(
    `INSERT INTO users (username, email, password_hash, first_name, last_name, phone, country)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [username, email, passwordHash, firstName || null, lastName || null, phone || null, country || null]
  );
  return findById(result.insertId);
}

async function updateProfile(id, fields) {
  const allowed = ['first_name', 'last_name', 'phone', 'country', 'avatar_url', 'banner_url', 'bio'];
  const sets = [];
  const values = [];
  for (const [key, value] of Object.entries(fields)) {
    if (allowed.includes(key)) {
      sets.push(`${key} = ?`);
      values.push(value);
    }
  }
  if (!sets.length) return findById(id);
  values.push(id);
  await getPool().query(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`, values);
  return findById(id);
}

async function search(query, excludeUserId) {
  const [rows] = await getPool().query(
    `SELECT id, username, email, first_name, last_name, avatar_url
     FROM users WHERE id != ? AND (username LIKE ? OR email LIKE ? OR first_name LIKE ?)
     LIMIT 50`,
    [excludeUserId, `%${query}%`, `%${query}%`, `%${query}%`]
  );
  return rows;
}

async function listOthers(excludeUserId) {
  const [rows] = await getPool().query(
    `SELECT id, username, email, first_name, last_name, avatar_url FROM users WHERE id != ?`,
    [excludeUserId]
  );
  return rows;
}

module.exports = { findByEmailOrUsername, findById, create, updateProfile, search, listOthers };
