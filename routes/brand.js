// routes/cartRoutes.js
const express = require("express");
const {
  createBrand,
  getAllBrand,
  getSingleBrand,
  updateBrand,
  deleteBrand,
} = require("../controllers/brand.controller");
const { auth, adminAuth } = require("../middleware/auth");

const router = express.Router();

router.post("/create-brand", adminAuth, createBrand);

router.get("/All-brand", adminAuth, getAllBrand);

router.get("/single-brand/:id", adminAuth, getSingleBrand);

router.put("/update-brand/:id", adminAuth, updateBrand),
  router.delete("/delete-brand/:id", adminAuth, deleteBrand);

module.exports = router;
