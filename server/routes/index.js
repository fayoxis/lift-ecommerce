const express = require('express');
const router = express.Router();

const productsRouter = require('./products.routes');
// const authRouter = require('./auth.routes');
// const ordersRouter = require('./orders.routes');

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

router.use('/products', productsRouter);
// router.use('/auth', authRouter);
// router.use('/orders', ordersRouter);

module.exports = router;
