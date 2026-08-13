const Cart = require('../models/Cart');

exports.getCart = async (req, res, next) => {
  try {
    res.json(await Cart.getCartWithTotals(req.userId));
  } catch (err) { next(err); }
};

exports.addItem = async (req, res, next) => {
  try {
    const { productId, qty } = req.body;
    if (!productId) return res.status(400).json({ error: 'productId is required' });
    await Cart.addItem(req.userId, productId, qty || 1);
    res.json(await Cart.getCartWithTotals(req.userId));
  } catch (err) { next(err); }
};

exports.setQty = async (req, res, next) => {
  try {
    const { qty } = req.body;
    await Cart.setQty(req.userId, req.params.productId, Number(qty));
    res.json(await Cart.getCartWithTotals(req.userId));
  } catch (err) { next(err); }
};

exports.removeItem = async (req, res, next) => {
  try {
    await Cart.removeItem(req.userId, req.params.productId);
    res.json(await Cart.getCartWithTotals(req.userId));
  } catch (err) { next(err); }
};

exports.clearCart = async (req, res, next) => {
  try {
    await Cart.clear(req.userId);
    res.json(await Cart.getCartWithTotals(req.userId));
  } catch (err) { next(err); }
};

exports.applyCoupon = async (req, res, next) => {
  try {
    const result = await Cart.applyCoupon(req.userId, req.body.code);
    res.json({ ...result, cart: await Cart.getCartWithTotals(req.userId) });
  } catch (err) { next(err); }
};
