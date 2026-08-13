const { getPool } = require('../config/db');

function genPostId() {
  return 'POST-' + Date.now().toString(36).toUpperCase().slice(-5) + Math.floor(Math.random() * 900 + 100);
}

/* ---------------- Follows ---------------- */
async function follow(followerId, followingId) {
  await getPool().query(
    'INSERT IGNORE INTO follows (follower_id, following_id) VALUES (?, ?)',
    [followerId, followingId]
  );
}
async function unfollow(followerId, followingId) {
  await getPool().query('DELETE FROM follows WHERE follower_id = ? AND following_id = ?', [followerId, followingId]);
}
async function isFollowing(followerId, followingId) {
  const [rows] = await getPool().query(
    'SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ? LIMIT 1',
    [followerId, followingId]
  );
  return rows.length > 0;
}
async function followersCount(userId) {
  const [[{ c }]] = await getPool().query('SELECT COUNT(*) c FROM follows WHERE following_id = ?', [userId]);
  return c;
}
async function followingCount(userId) {
  const [[{ c }]] = await getPool().query('SELECT COUNT(*) c FROM follows WHERE follower_id = ?', [userId]);
  return c;
}

/* ---------------- Posts ---------------- */
async function createPost(authorId, { type, text, productId, imageUrl }) {
  const id = genPostId();
  await getPool().query(
    `INSERT INTO posts (id, author_id, type, text, product_id, image_url)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, authorId, type || 'announcement', text || null, productId || null, imageUrl || null]
  );
  return getPostById(id);
}

async function getPostById(id) {
  const [rows] = await getPool().query(
    `SELECT p.*, u.username AS author_username, u.first_name AS author_first, u.avatar_url AS author_avatar
     FROM posts p JOIN users u ON u.id = p.author_id WHERE p.id = ?`,
    [id]
  );
  return rows[0] || null;
}

async function feed(limit = 50) {
  const [rows] = await getPool().query(
    `SELECT p.*, u.username AS author_username, u.first_name AS author_first, u.avatar_url AS author_avatar
     FROM posts p JOIN users u ON u.id = p.author_id
     ORDER BY p.created_at DESC LIMIT ?`,
    [limit]
  );
  return rows;
}

async function likePost(postId, userId) {
  await getPool().query('INSERT IGNORE INTO post_likes (post_id, user_id) VALUES (?, ?)', [postId, userId]);
}
async function unlikePost(postId, userId) {
  await getPool().query('DELETE FROM post_likes WHERE post_id = ? AND user_id = ?', [postId, userId]);
}
async function likeCount(postId) {
  const [[{ c }]] = await getPool().query('SELECT COUNT(*) c FROM post_likes WHERE post_id = ?', [postId]);
  return c;
}

async function addComment(postId, authorId, text) {
  const [result] = await getPool().query(
    'INSERT INTO post_comments (post_id, author_id, text) VALUES (?, ?, ?)',
    [postId, authorId, text]
  );
  const [rows] = await getPool().query('SELECT * FROM post_comments WHERE id = ?', [result.insertId]);
  return rows[0];
}
async function commentsFor(postId) {
  const [rows] = await getPool().query(
    `SELECT c.*, u.username, u.avatar_url FROM post_comments c
     JOIN users u ON u.id = c.author_id WHERE c.post_id = ? ORDER BY c.created_at ASC`,
    [postId]
  );
  return rows;
}

module.exports = {
  follow, unfollow, isFollowing, followersCount, followingCount,
  createPost, getPostById, feed, likePost, unlikePost, likeCount,
  addComment, commentsFor,
};
