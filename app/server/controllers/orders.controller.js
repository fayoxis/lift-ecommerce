const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Notification = require('../models/Notification');

exports.createOrder = async (req, res, next) => {
  try {
    const { method, phone } = req.body;
    if (!method) return res.status(400).json({ error: 'Payment method is required' });

    const cart = await Cart.getCartWithTotals(req.userId);
    if (!cart.lines.length) return res.status(400).json({ error: 'Cart is empty' });

    const order = await Order.create(req.userId, { cart, method, phone });
    await Notification.create(
      req.userId,
      'order',
      `Your order ${order.id} has been placed`,
      'orders.html'
    );
    res.status(201).json({ order });
  } catch (err) { next(err); }
};

exports.listOrders = async (req, res, next) => {
  try {
    res.json({ orders: await Order.findAllForUser(req.userId) });
  } catch (err) { next(err); }
};

exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id, req.userId);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ order });
  } catch (err) { next(err); }
};

exports.cancelOrder = async (req, res, next) => {
  try {
    const ok = await Order.cancel(req.params.id, req.userId);
    if (!ok) return res.status(400).json({ error: 'Order can no longer be cancelled' });
    res.json({ ok: true });
  } catch (err) { next(err); }
};
