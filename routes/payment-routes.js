const express = require('express');
const { initiatePayment } = require('../controllers/payment-controller');
const router = express.Router();

router.post('/initiate', initiatePayment);

module.exports = router;