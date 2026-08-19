require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');

const { connectDB } = require('./config/db');
const apiRoutes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

// ---- Core middleware ----
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---- API routes ----
// Everything the backend exposes lives under /api, so it never collides
// with the static frontend routes below.
app.use('/api', apiRoutes);

// ---- Static frontend ----
// The App folder is the project root: index.html sits at the top level,
// with pages/, css/, js/, and assets/ alongside it. Only those specific
// folders (plus index.html) are exposed — server/ and database/ are not.
const appRoot = path.join(__dirname, '..');
app.get('/', (req, res) => res.sendFile(path.join(appRoot, 'index.html')));
app.use('/pages', express.static(path.join(appRoot, 'pages')));
app.use('/css', express.static(path.join(appRoot, 'css')));
app.use('/js', express.static(path.join(appRoot, 'js')));
app.use('/assets', express.static(path.join(appRoot, 'assets')));

// Fallback: any non-API GET request that isn't a static file goes to index.html
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(appRoot, 'index.html'));
});

// ---- 404 handler for unmatched /api routes ----
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ---- Error handler ----
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

connectDB().finally(() => {
  app.listen(PORT, () => {
    console.log(`LIFT server running at http://localhost:${PORT}`);
  });
});
