const express = require("express");
const {
  allSpecificationsBycategory,
  allSpecifications,
  addSpecification,
  updateStatus,
  deleteSpecification,
  getSpecificationById,
  updateSpecification
} = require("../controllers/specification-controller");

const router = express.Router();

router.post("/add", addSpecification);

router.get("/specifications/category/:categoryId", allSpecificationsBycategory);

router.get("/", allSpecifications);

//show/hide status
router.put('/status/:id', updateStatus);

//delete a specification
router.delete('/:id', deleteSpecification);

//get a specification
router.get('/:id', getSpecificationById);

//update a specification
router.put('/:id', updateSpecification);

module.exports = router
