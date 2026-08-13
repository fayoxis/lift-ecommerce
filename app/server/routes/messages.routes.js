const express = require('express');
const router = express.Router();
const messagesController = require('../controllers/messages.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.use(requireAuth);

router.get('/', messagesController.inbox);              // GET /api/messages -> inbox threads
router.get('/:userId', messagesController.conversation); // GET /api/messages/:userId -> thread
router.post('/', messagesController.send);               // POST /api/messages { to, text }

module.exports = router;
