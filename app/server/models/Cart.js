const { getPool } = require('../config/db');
const Product = require('./Product');

const COUPONS = { LIFT10: 0.10, WELCOME5: 0.05 };

async function getItems(userId) {
  const [rows] = await getPool().query(
    'SELECT product_id, quantity, coupon_code FROM cart_items WHERE user_id = ?',
    [userId]
  );
  return rows;
}

async function addItem(userId, productId, qty) {
  await getPool().query(
    `INSERT INTO cart_items (user_id, product_id, quantity)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
    [userId, productId, qty || 1]
  );
  return getCartWithTotals(userId);
}

async function setQty(userId, productId, qty) {
  if (qty <= 0) {
    await getPool().query('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?', [userId, productId]);
  } else {
    await getPool().query(
      `INSERT INTO cart_items (user_id, product_id, quantity)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE quantity = VALUES(quantity)`,
      [userId, productId, qty]
    );
  }
  return getCartWithTotals(userId);
}

async function removeItem(userId, productId) {
  await getPool().query('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?', [userId, productId]);
  return getCartWithTotals(userId);
}

async function clear(userId) {
  await getPool().query('DELETE FROM cart_items WHERE user_id = ?', [userId]);
}

async function applyCoupon(userId, code) {
  const clean = (code || '').trim().toUpperCase();
  const valid = Object.prototype.hasOwnProperty.call(COUPONS, clean);
  await getPool().query('UPDATE cart_items SET coupon_code = ? WHERE user_id = ?', [valid ? clean : null, userId]);
  return { ok: valid, rate: valid ? COUPONS[clean] : 0 };
}

async function getCartWithTotals(userId) {
  const items = await getItems(userId);
  const lines = [];
  for (const item of items) {
    const product = await Product.findById(item.product_id);
    if (!product) continue;
    lines.push({
      id: product.id,
      name: product.name,
      price: product.price,
      img: product.img,
      qty: item.quantity,
      lineTotal: product.price * item.quantity,
    });
  }
  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  const coupon = items.length ? items[0].coupon_code : null;
  const rate = coupon && COUPONS[coupon] ? COUPONS[coupon] : 0;
  const discount = Math.round(subtotal * rate);
  const count = lines.reduce((s, l) => s + l.qty, 0);
  return { lines, subtotal, discount, coupon, total: Math.max(0, subtotal - discount), count };
}

module.exports = { getItems, addItem, setQty, removeItem, clear, applyCoupon, getCartWithTotals, COUPONS };
