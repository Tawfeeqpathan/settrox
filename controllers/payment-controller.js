const crypto = require('crypto'); // For generating a unique payment ID
const Order = require('../models/order');

exports.initiatePayment = async (req, res) => {
  try {
    const { orderId, amount } = req.body;

    // Validate the request body
    const order = await Order.findById(orderId);
    
    if (!order || order.products.length === 0) {
      return res.status(400).json({ message: 'Your order is empty. Please add products to your cart.' });
    }
    if (!orderId || !amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'Invalid order details.' });
    }

    // Generate a unique payment ID (can be replaced with an actual gateway's payment session ID)
    const paymentId = crypto.randomBytes(16).toString('hex');

    // Mock payment URL (replace with actual payment gateway URL)
    const paymentUrl = `https://mockpaymentgateway.com/pay/${paymentId}`;

    // Respond with the payment URL and payment ID
    res.status(200).json({
      paymentUrl,
      paymentId,
    });
  } catch (error) {
    console.error('Error initiating payment:', error);
    res.status(500).json({ error: 'Failed to initiate payment.' });
  }
};
