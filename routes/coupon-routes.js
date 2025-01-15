// routes/cartRoutes.js
const express = require('express');
const { addCoupon, listCoupons, removeCoupon } = require('../controllers/coupon-controller');

const router = express.Router();

// Add coupon
router.post('/add', addCoupon);

// Get coupon
router.post('/', listCoupons);

// Remove coupon
router.post('/remove', removeCoupon);

module.exports = router;
