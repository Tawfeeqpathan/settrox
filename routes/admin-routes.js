const express = require('express');
const router = express.Router();

const User = require('../models/user');
const Product = require('../models/products');
const Faq = require('../models/faq');
const Order = require('../models/order');

// Dashboard
// router.get('/', (req, res) => {
//   res.render('dashboard', { page: 'Dashboard' });
// });


// Users
router.get('/login', async (req, res) => {
  try {
    const error = null;
    res.render('login', { page: 'Login', content:"Login", error });
  } catch (error) {
    res.status(500).send('Error Login');
  }
});

// Users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find(); // Fetch all users
    res.render('layout', { page: 'Users', content:"Users", users });
  } catch (error) {
    res.status(500).send('Error fetching users');
  }
});

// Faqs
router.get('/faqs', async (req, res) => {
  try {
    const faqs = await Faq.find(); // Fetch all products
    res.render('layout', { page: 'Faqs',content:"Faqs", faqs });
  } catch (error) {
    res.status(500).send('Error fetching faqs');
  }
});
// Edit Faqs
router.get('/faqs/:id/edit', async (req, res) => {
  try {
    console.log('req.params.id',req.params.id);
    const faq = await Faq.findById(req.params.id); 
    res.render('layout', { page: 'faqs_edit',content:"faqs_edit", faq });
  } catch (error) {
    res.status(500).send('Error fetching faqs');
  }
});

// Orders
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find(); // Fetch all orders
    res.render('layout', { page: 'Orders' ,content:"Orders", orders });
  } catch (error) {
    res.status(500).send('Error fetching orders');
  }
});

module.exports = router;