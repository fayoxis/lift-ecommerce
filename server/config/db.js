// Database connection setup.
// Fill this in once you pick a database (MongoDB, PostgreSQL, MySQL, etc).
//
// Example for MongoDB with mongoose:
//
// const mongoose = require('mongoose');
// module.exports = async function connectDB() {
//   await mongoose.connect(process.env.DATABASE_URL);
//   console.log('MongoDB connected');
// };

module.exports = async function connectDB() {
  console.log('No database configured yet — running with placeholder data.');
};
