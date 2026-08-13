const Notification = require('../models/Notification');

exports.list = async (req, res, next) => {
  try {
    res.json({ notifications: await Notification.forUser(req.userId) });
  } catch (err) { next(err); }
};

exports.markAllRead = async (req, res, next) => {
  try {
    await Notification.markAllRead(req.userId);
    res.json({ ok: true });
  } catch (err) { next(err); }
};

exports.markOneRead = async (req, res, next) => {
  try {
    await Notification.markOneRead(req.params.id, req.userId);
    res.json({ ok: true });
  } catch (err) { next(err); }
};
