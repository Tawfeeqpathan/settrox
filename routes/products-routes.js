const express = require('express');
const productController = require('../controllers/product-controller');
const productVariantController = require("../controllers/product-variant-controller")
const productAttributeController = require('../controllers/product-attribute-controller');
const upload = require('../utils/fileUploader');

const router = express.Router();

// Create Product
router.post('/add',upload.array('images', 5), productController.createProduct);

// Get All Products
router.get('/', productController.getAllProducts);

router.post('/createmany', productController.insertManyProducts);

// Get Product by ID
router.get('/byid/:id', productController.getProductByIdFront);

// Get Product by ID
router.post('/:id', productController.getProductById);

// Get Product by Slug
router.get('/:slug', productController.getProductBySlug);

// Update Product
router.patch('/:id', productController.updateProduct);

// Delete Product
router.delete('/:id', productController.deleteProduct);

// Search Products (with filters)
router.get('/search', productController.searchProducts);

// get product by brandId
router.get('/brand/:brand', productController.getProductsByBrand);

//get product by categoryId
router.get('/category/:categoryId', productController.getProductsByCategory);
 

// Add ProductAttribute
router.post('/attribute/add', productAttributeController.addProductAttribute);

// Update ProductAttribute
router.put('/attribute/:id', productAttributeController.updateProductAttribute);
 
// Remove ProductAttribute
router.get('/attribute/:id/remove', productAttributeController.removeProductAttribute);

// Get ProductAttribute
router.get('/attribute/show', productAttributeController.showProductAttribute); 

// Get ProductAttribute
router.get('/attribute/get-all', productAttributeController.getAllProductAttribute);

// List ProductAttribute
router.get('/attribute/list', productAttributeController.list);

// edit ProductAttribute
router.get('/attribute/:id', productAttributeController.editForm);
router.delete('/attribute/:id', productAttributeController.deleteAttribute);
router.patch('/attribute/delete/many', productAttributeController.deleteManyAttribute);

router.get('/attribute/child/:parentId/:childId', productAttributeController.getChildAttribute);
router.put('/attribute/add/child/:parentId', productAttributeController.addChildAttribute);
router.put('/attribute/delete/child/:parentId/:childId', productAttributeController.deleteChildAttribute);
router.patch('/attribute/delete/child/many', productAttributeController.deleteManyChildAttribute);

 
// Add a new variant to a product
router.post('/varient/add', productVariantController.addProductVariant);





// Edit an existing product variant
router.put('/varient/update', productVariantController.updateProductVariant);

// Delete a product variant
router.delete('/varient/delete/:productId/:variantId', productVariantController.deleteProductVariant);

// Get all variants of a product
router.get('/varient/:productId', productVariantController.getProductVariants);

module.exports = router;
