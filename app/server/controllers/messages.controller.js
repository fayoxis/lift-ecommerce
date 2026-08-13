const Message = require('../models/Message');
const Notification = require('../models/Notification');
const User = require('../models/User');

exports.inbox = async (req, res, next) => {
  try {
    res.json({ threads: await Message.inboxThreads(req.userId) });
  } catch (err) { next(err); }
};

exports.conversation = async (req, res, next) => {
  try {
    const otherId = req.params.userId;
    await Message.markThreadRead(req.userId, otherId);
    res.json({ messages: await Message.conversation(req.userId, otherId) });
  } catch (err) { next(err); }
};

exports.send = async (req, res, next) => {
  try {
    const { to, text } = req.body;
    if (!to || !text) return res.status(400).json({ error: 'to and text are required' });
    const msg = await Message.send(req.userId, to, text);
    const me = await User.findById(req.userId);
    await Notification.create(to, 'message', `${me.username} sent you a message`, `messages.html?to=${me.id}`);
    res.status(201).json({ message: msg });
  } catch (err) { next(err); }
};
