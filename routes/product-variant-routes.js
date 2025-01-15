const express = require('express');
const router = express.Router();
const productVariantController = require('../controllers/product-variant-controller');

// Add a new variant to a product
router.post('/add', productVariantController.addVariant);

// Edit an existing product variant
router.put('/update', productVariantController.updateVariant);

// Delete a product variant
router.delete('/delete/:productId/:variantId', productVariantController.deleteVariant);

// Get all variants of a product
router.get('/:productId/variants', productVariantController.getVariants);

module.exports = router;
