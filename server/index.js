require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');

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
// Serves everything in client/public (index.html, login.html, css, js, etc.)
const clientPath = path.join(__dirname, '..', 'client', 'public');
app.use(express.static(clientPath));

// Fallback: any non-API GET request that isn't a static file goes to index.html
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(clientPath, 'index.html'));
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

app.listen(PORT, () => {
  console.log(`LIFT server running at http://localhost:${PORT}`);
});
