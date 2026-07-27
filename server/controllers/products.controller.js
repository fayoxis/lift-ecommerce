// Replace this in-memory data with a real model/database call
// (see server/models and server/config/db.js) once a database is chosen.
const placeholderProducts = [
  { id: 1, name: 'Sample Product 1', price: 29.99 },
  { id: 2, name: 'Sample Product 2', price: 49.99 },
];

exports.getAllProducts = (req, res) => {
  res.json(placeholderProducts);
};

exports.getProductById = (req, res) => {
  const product = placeholderProducts.find(
    (p) => p.id === Number(req.params.id)
  );
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
};
