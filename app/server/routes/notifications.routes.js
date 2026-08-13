const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notifications.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.use(requireAuth);

router.get('/', notificationsController.list);
router.post('/read-all', notificationsController.markAllRead);
router.post('/:id/read', notificationsController.markOneRead);

module.exports = router;
