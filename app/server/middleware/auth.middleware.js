const jwt = require('jsonwebtoken');

function getSecret() {
  return process.env.JWT_SECRET || 'change_me';
}

function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email, username: user.username }, getSecret(), {
    expiresIn: '7d',
  });
}

/* Rejects the request if no valid token is present. */
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = jwt.verify(token, getSecret());
    req.userId = payload.sub;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/* Attaches req.userId if a valid token is present, but doesn't reject
   the request otherwise. Useful for routes that behave differently for
   guests vs logged-in users (e.g. the product feed). */
function optionalAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (token) {
    try {
      const payload = jwt.verify(token, getSecret());
      req.userId = payload.sub;
    } catch (err) {
      // ignore invalid token, continue as guest
    }
  }
  next();
}

module.exports = { requireAuth, optionalAuth, signToken };
