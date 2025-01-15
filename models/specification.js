const mongoose = require("mongoose");

const specificationSchema = new mongoose.Schema(
  {
    title: { type: Object,
      required: true },
    parentName: { type: String, required: false },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Categories",
      required: true,
    },
    attributes: [
      {
        label: { type: String, required: true },
        value: { type: String, required: true },
      },
    ],
    status: {
      type: String,
      lowercase: true,
      enum: ['show', 'hide'],
      default: 'show',
    }
  },
  {
    Timestamp: true,
  }
);

const Specification = mongoose.model("Specification", specificationSchema);

module.exports = Specification;
