const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/orders.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.use(requireAuth);

router.get('/', ordersController.listOrders);
router.post('/', ordersController.createOrder);
router.get('/:id', ordersController.getOrder);
router.post('/:id/cancel', ordersController.cancelOrder);

module.exports = router;
