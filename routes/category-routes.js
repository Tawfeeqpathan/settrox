const express = require('express');
const router = express.Router();
const {
  addCategory,
  addAllCategory,
  getAllCategory,
  getHeaderCategories,
  getAllCategories,
  getShowingCategory,
  getCategoryById,
  updateCategory,
  updateStatus,
  deleteCategory,
  deleteManyCategory,
  updateManyCategory,
  getHomeCategories

} = require('../controllers/category-controller');

//add a category
router.post('/add', addCategory);

//add all category
router.post('/add/all', addAllCategory);

//get only showing category
router.get('/show', getShowingCategory);

//get all category
router.get('/', getAllCategory);

//get allCategoryHeader
router.get('/allCategoryHeader', getHeaderCategories);
//get all category

router.get('/allHomeCategory', getHomeCategories);

router.get('/all', getAllCategories);

//get a category
router.get('/:id', getCategoryById);

//update a category
router.put('/:id', updateCategory);

//show/hide a category
router.put('/status/:id', updateStatus);

//delete a category
router.delete('/:id', deleteCategory);

// delete many category
router.patch('/delete/many', deleteManyCategory);

// update many category
router.patch('/update/many', updateManyCategory);

module.exports = router;
