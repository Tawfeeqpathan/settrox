const express = require('express');
const { index, getOrderById, createOrder, getOrdersByUser, updateOrderStatus, createPreOrder } = require('../controllers/order-controller');
const router = express.Router();

router.get('/', index);
router.post('/create', createOrder);
router.post('/preOrder/create', createPreOrder);
router.post('/user', getOrdersByUser);
router.post('/id', getOrderById);
router.put('/:id', updateOrderStatus);

module.exports = router;
