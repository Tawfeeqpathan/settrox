const express = require('express');
const router = express.Router();
const {
  addBrand,
  addAllBrands,
  getAllBrands,
  getShowingBrands,
  getBrandById,
  updateBrand,
  updateStatus,
  deleteBrand,
  deleteManyBrands,
  updateManyBrands
} = require('../controllers/brand-controller');

// Add a brand
router.post('/add', addBrand);

// Add multiple brands
router.post('/add/all', addAllBrands);

// Get only showing brands
router.get('/show', getShowingBrands);

// Get all brands
router.get('/all', getAllBrands);

// Get a single brand by ID
router.get('/:id', getBrandById);

// Update a brand
router.put('/:id', updateBrand);

// Show/Hide a brand
router.put('/status/:id', updateStatus);

// Delete a brand
router.delete('/:id', deleteBrand);

// Delete multiple brands
router.patch('/delete/many', deleteManyBrands);

// Update multiple brands
router.patch('/update/many', updateManyBrands);

module.exports = router;
