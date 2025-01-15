// routes/wishlistRoutes.js
const express = require('express');
const { addRemoveToWishlist, getWishlist } = require('../controllers/wishlist-controller');

const router = express.Router(); 

// Add/Remove product to wishlist
router.post('/add-remove', addRemoveToWishlist);

// Get the current wishlist
router.post('/', getWishlist);
 

module.exports = router;
