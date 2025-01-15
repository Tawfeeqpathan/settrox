const express = require('express');
const { index, getOrderById, createOrder, getOrdersByUser, updateOrderStatus } = require('../controllers/order-controller');
const router = express.Router();

router.get('/', index);
router.post('/create', createOrder);
router.post('/user', getOrdersByUser);
router.post('/id', getOrderById);
router.put('/:id', updateOrderStatus);

module.exports = router;
