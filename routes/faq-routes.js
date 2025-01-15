// routes/cartRoutes.js
const express = require('express');
const { addFaq, getAllFaq,list, updateFaq, removeFaq, toggleStatus, editForm } = require('../controllers/faq-controller');

const router = express.Router();

// Add FAQ
router.post('/add', addFaq);

// Update FAQ
router.post('/update', updateFaq);

// Get FAQ
router.get('/', getAllFaq);

// Remove FAQ
router.post('/remove', removeFaq);


// List FAQ
router.get('/list', list);

// Toggle FAQ status
router.patch('/:id/toggle-status', toggleStatus);


// Edit FAQ
router.get('/:id/edit', editForm);

module.exports = router;
