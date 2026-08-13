const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.get('/', requireAuth, usersController.listPeople);      // GET /api/users?q=
router.put('/me', requireAuth, usersController.updateProfile); // PUT /api/users/me
router.get('/:id', requireAuth, usersController.getUser);

module.exports = router;
