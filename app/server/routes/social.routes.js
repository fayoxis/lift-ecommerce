const express = require('express');
const router = express.Router();
const socialController = require('../controllers/social.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.use(requireAuth);

router.get('/feed', socialController.getFeed);
router.post('/posts', socialController.createPost);
router.post('/posts/:postId/like', socialController.likePost);
router.delete('/posts/:postId/like', socialController.unlikePost);
router.post('/posts/:postId/comments', socialController.addComment);

router.post('/follow/:userId', socialController.follow);
router.delete('/follow/:userId', socialController.unfollow);

module.exports = router;
