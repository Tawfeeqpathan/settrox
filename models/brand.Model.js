const mongoose = require("mongoose");

const adminBrandSchema = new mongoose.Schema(
  {
    brandName: { type: String, required: true },
    slug: { type: String, required: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    metaTitle: { type: String },
    metaKeywords: { type: String },
    metaDescription: { type: String },
  },
  {
    timestamps: true,
  }
);

const brand = mongoose.model("BrandModel", adminBrandSchema);
module.exports = brand;
