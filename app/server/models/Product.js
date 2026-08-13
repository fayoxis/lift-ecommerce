const { getPool } = require('../config/db');

const BASE_SELECT = `
  SELECT p.id, p.name, c.name AS category, p.price, p.rating, p.location,
         p.image_url AS img, p.sizes, p.stock, p.is_active
  FROM products p
  LEFT JOIN categories c ON c.id = p.category_id
`;

async function findAll({ q, category, minPrice, maxPrice } = {}) {
  const clauses = ['p.is_active = 1'];
  const values = [];

  if (q) {
    clauses.push('p.name LIKE ?');
    values.push(`%${q}%`);
  }
  if (category) {
    clauses.push('c.name = ?');
    values.push(category);
  }
  if (minPrice) {
    clauses.push('p.price >= ?');
    values.push(minPrice);
  }
  if (maxPrice) {
    clauses.push('p.price <= ?');
    values.push(maxPrice);
  }

  const sql = `${BASE_SELECT} WHERE ${clauses.join(' AND ')} ORDER BY p.name ASC`;
  const [rows] = await getPool().query(sql, values);
  return rows.map(normalize);
}

async function findById(id) {
  const [rows] = await getPool().query(`${BASE_SELECT} WHERE p.id = ? LIMIT 1`, [id]);
  return rows[0] ? normalize(rows[0]) : null;
}

async function decrementStock(id, qty) {
  await getPool().query('UPDATE products SET stock = GREATEST(0, stock - ?) WHERE id = ?', [qty, id]);
}

function normalize(row) {
  return {
    ...row,
    price: Number(row.price),
    rating: Number(row.rating),
    sizes: row.sizes ? row.sizes.split(',') : undefined,
  };
}

module.exports = { findAll, findById, decrementStock };
