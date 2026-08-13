const User = require('../models/User');
const Social = require('../models/Social');
const { publicUser } = require('./auth.controller');

exports.updateProfile = async (req, res, next) => {
  try {
    const { first, last, phone, country, avatar, banner, bio } = req.body;
    const user = await User.updateProfile(req.userId, {
      first_name: first, last_name: last, phone, country,
      avatar_url: avatar, banner_url: banner, bio,
    });
    res.json({ user: publicUser(user) });
  } catch (err) {
    next(err);
  }
};

exports.listPeople = async (req, res, next) => {
  try {
    const q = req.query.q;
    const users = q ? await User.search(q, req.userId) : await User.listOthers(req.userId);
    const withFollowState = await Promise.all(
      users.map(async (u) => ({
        ...u,
        followers: await Social.followersCount(u.id),
        isFollowing: await Social.isFollowing(req.userId, u.id),
      }))
    );
    res.json({ users: withFollowState });
  } catch (err) {
    next(err);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({
      user: publicUser(user),
      followers: await Social.followersCount(user.id),
      following: await Social.followingCount(user.id),
    });
  } catch (err) {
    next(err);
  }
};
