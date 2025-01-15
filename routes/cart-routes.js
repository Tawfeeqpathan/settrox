// routes/cartRoutes.js
const express = require('express');
const { addToCart, getCart, removeFromCart } = require('../controllers/cart-controller');

const router = express.Router();

// Add product to cart
router.post('/add', addToCart);

// Get the current cart
router.post('/', getCart);

// Remove product from cart
router.post('/remove', removeFromCart);

module.exports = router;
