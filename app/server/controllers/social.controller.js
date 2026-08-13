const Social = require('../models/Social');
const Notification = require('../models/Notification');
const User = require('../models/User');

exports.follow = async (req, res, next) => {
  try {
    const targetId = req.params.userId;
    await Social.follow(req.userId, targetId);
    const me = await User.findById(req.userId);
    await Notification.create(targetId, 'follow', `${me.username} started following you`, 'people.html');
    res.json({ ok: true });
  } catch (err) { next(err); }
};

exports.unfollow = async (req, res, next) => {
  try {
    await Social.unfollow(req.userId, req.params.userId);
    res.json({ ok: true });
  } catch (err) { next(err); }
};

exports.getFeed = async (req, res, next) => {
  try {
    const posts = await Social.feed();
    const withCounts = await Promise.all(
      posts.map(async (p) => ({
        ...p,
        likeCount: await Social.likeCount(p.id),
        comments: await Social.commentsFor(p.id),
      }))
    );
    res.json({ posts: withCounts });
  } catch (err) { next(err); }
};

exports.createPost = async (req, res, next) => {
  try {
    const { type, text, productId, img } = req.body;
    const post = await Social.createPost(req.userId, { type, text, productId, imageUrl: img });
    res.status(201).json({ post });
  } catch (err) { next(err); }
};

exports.likePost = async (req, res, next) => {
  try {
    const post = await Social.getPostById(req.params.postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    await Social.likePost(req.params.postId, req.userId);
    if (post.author_id !== req.userId) {
      const me = await User.findById(req.userId);
      await Notification.create(post.author_id, 'like', `${me.username} liked your post`, 'profile.html');
    }
    res.json({ likeCount: await Social.likeCount(req.params.postId) });
  } catch (err) { next(err); }
};

exports.unlikePost = async (req, res, next) => {
  try {
    await Social.unlikePost(req.params.postId, req.userId);
    res.json({ likeCount: await Social.likeCount(req.params.postId) });
  } catch (err) { next(err); }
};

exports.addComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'text is required' });
    const post = await Social.getPostById(req.params.postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    const comment = await Social.addComment(req.params.postId, req.userId, text);
    if (post.author_id !== req.userId) {
      const me = await User.findById(req.userId);
      await Notification.create(post.author_id, 'comment', `${me.username} commented on your post`, 'profile.html');
    }
    res.status(201).json({ comment });
  } catch (err) { next(err); }
};
