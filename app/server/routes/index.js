const express = require('express');
const router = express.Router();

const authRouter = require('./auth.routes');
const usersRouter = require('./users.routes');
const productsRouter = require('./products.routes');
const cartRouter = require('./cart.routes');
const ordersRouter = require('./orders.routes');
const socialRouter = require('./social.routes');
const messagesRouter = require('./messages.routes');
const notificationsRouter = require('./notifications.routes');

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

router.use('/auth', authRouter);
router.use('/users', usersRouter);
router.use('/products', productsRouter);
router.use('/cart', cartRouter);
router.use('/orders', ordersRouter);
router.use('/social', socialRouter);
router.use('/messages', messagesRouter);
router.use('/notifications', notificationsRouter);

module.exports = router;
