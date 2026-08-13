const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { signToken } = require('../middleware/auth.middleware');

function publicUser(u) {
  return {
    id: u.id,
    username: u.username,
    email: u.email,
    first: u.first_name,
    last: u.last_name,
    phone: u.phone,
    country: u.country,
    avatar: u.avatar_url,
    banner: u.banner_url,
    bio: u.bio,
  };
}

exports.signup = async (req, res, next) => {
  try {
    const { username, email, password, first, last, phone, country } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'username, email and password are required' });
    }
    const existing = await User.findByEmailOrUsername(email) || await User.findByEmailOrUsername(username);
    if (existing) return res.status(409).json({ error: 'Email or username already in use' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, passwordHash, firstName: first, lastName: last, phone, country });
    const token = signToken(user);
    res.status(201).json({ token, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body; // identifier = email or username
    if (!identifier || !password) {
      return res.status(400).json({ error: 'identifier and password are required' });
    }
    const user = await User.findByEmailOrUsername(identifier);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = signToken(user);
    res.json({ token, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: publicUser(user) });
  } catch (err) {
    next(err);
  }
};

exports.publicUser = publicUser;
