const { getPool } = require('../config/db');

function genOrderId() {
  return 'LIFT-' + Date.now().toString(36).toUpperCase().slice(-5) + Math.floor(Math.random() * 900 + 100);
}

async function create(userId, { cart, method, phone }) {
  const pool = getPool();
  const conn = await pool.getConnection();
  const id = genOrderId();
  try {
    await conn.beginTransaction();
    await conn.query(
      `INSERT INTO orders (id, user_id, subtotal, discount, total, payment_method, phone, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'processing')`,
      [id, userId, cart.subtotal, cart.discount, cart.total, method, phone || null]
    );
    for (const line of cart.lines) {
      await conn.query(
        `INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, line_total)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [id, line.id, line.name, line.price, line.qty, line.lineTotal]
      );
      await conn.query('UPDATE products SET stock = GREATEST(0, stock - ?) WHERE id = ?', [line.qty, line.id]);
    }
    await conn.query('DELETE FROM cart_items WHERE user_id = ?', [userId]);
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
  return findById(id, userId);
}

async function findAllForUser(userId) {
  const [orders] = await getPool().query(
    'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
  const results = [];
  for (const order of orders) {
    const [items] = await getPool().query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
    results.push({ ...order, items });
  }
  return results;
}

async function findById(id, userId) {
  const [rows] = await getPool().query('SELECT * FROM orders WHERE id = ? AND user_id = ? LIMIT 1', [id, userId]);
  if (!rows[0]) return null;
  const [items] = await getPool().query('SELECT * FROM order_items WHERE order_id = ?', [id]);
  return { ...rows[0], items };
}

async function cancel(id, userId) {
  const order = await findById(id, userId);
  if (!order || order.status !== 'processing') return false;
  await getPool().query('UPDATE orders SET status = ? WHERE id = ?', ['cancelled', id]);
  return true;
}

module.exports = { create, findAllForUser, findById, cancel };
