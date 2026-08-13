// Database connection (MySQL / MariaDB via mysql2).
//
// Reads connection details from environment variables (see .env.example).
// Exposes a shared connection pool used by every model in server/models.
//
// Setup:
//   1. Create the database:      mysql -u root -p -e "CREATE DATABASE lift_ecommerce"
//   2. Load the schema:          mysql -u root -p lift_ecommerce < database/schema.sql
//   3. (optional) Seed data:     mysql -u root -p lift_ecommerce < database/seed.sql
//   4. Copy .env.example to .env and fill in DB_* values.

const mysql = require('mysql2/promise');

let pool = null;

function getPool() {
  if (pool) return pool;

  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'lift_ecommerce',
    waitForConnections: true,
    connectionLimit: 10,
    dateStrings: true,
  });

  return pool;
}

async function connectDB() {
  try {
    const conn = await getPool().getConnection();
    console.log('MySQL connected:', process.env.DB_NAME || 'lift_ecommerce');
    conn.release();
  } catch (err) {
    console.error('MySQL connection failed:', err.message);
    console.error('The API will still start, but DB-backed routes will error until this is fixed.');
    console.error('Check your .env DB_* values and confirm database/schema.sql has been loaded.');
  }
}

module.exports = { connectDB, getPool };
