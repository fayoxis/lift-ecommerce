// Example placeholder auth middleware.
// Wire this up once you add a real auth strategy (JWT, sessions, etc.)
module.exports = function requireAuth(req, res, next) {
  // const token = req.headers.authorization?.split(' ')[1];
  // if (!token) return res.status(401).json({ error: 'Unauthorized' });
  // ...verify token...
  next();
};
