const mongoose = require('mongoose');
  
const VariantSchema = new mongoose.Schema({
  originalPrice: {
    type: Number,
    required: true,
  },
  preOrder:{
    type: Boolean,
    default: false,
  },
  preOrderPrice:{
    type: Number,
  },
  preOrderDate:{
    type:Date,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  discount: {
    type: Number,
    default: 0,
  },
  productId: {
    type: String,
    required: true,
    unique: true, 
  },
  barcode: {
    type: String,
    default: '',
  },
  sku: {
    type: String,
    default: '',
  },
  attributeName:{
      type: String,
    },
  attributeValue:{
      type: String,
    },
    attributeImage:{
      type: String,
    },
    attributeType:{
      type: String,
    },
    subAttribute:{
      type: String,
    },
    subAttributeType:{
      type: String,
    }  
});

// Define the product schema
const productSchema = new mongoose.Schema({
  title: {
    type: Map,
    of: String,  
    required: true,
  },
  preOrder:{
    type: Boolean,
    default: false,
  },
  preOrderPrice:{
    type: Number,
  },
  preOrderDate:{
    type:Date,
  },

  description: {
    type: Map,
    of: String,  
    required: true,
  }, 
  product_feature: {
    type: Map,
    of: String,  
    required: true,
  },
  features_video: {
    type: String, 
    required: false,
  },
  features: [
    {
      feature_title: { type: String,  },
      feature_subtitle: { type: String, },
      feature_description: { type: String,  },
      image: { type: String, },
    },
  ],
  slug: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Categories', // Assuming a single category is selected for the product
    required: true,
  }, 
  barcode: { type: String, required: true }, 
  productId: { type: String, required: false },
  price: { type: Number, required: true },
  originalPrice: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  topSeller: { type: Boolean, required: true, default: 0 },
  stock: { type: Number, required: true, default: 0 },
  image: [String],
  sku: { type: String, required: true }, 
  attributes: [
      {
          name: { type: String, required: true },
          value: { type: String, required: true },
      }
  ],
  variants: [VariantSchema],
  categories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Categories', // Assuming the categories are stored in a Category model
    },
  ],
  brand: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand', 
    },
  ], 
  specification: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Specification', 
    },
  ],
  tag: {
    type: [String],
    default: [],
  }, 
  isCombination: {
    type: Boolean,
    default: false,
  },
  meta_title: { type: Map, of: String, required: false },
  meta_description: { type: Map, of: String, required: false },
  status: {
    type: String,
    lowercase: true,
    enum: ['show', 'hide'],
    default: 'show',
  }, 
  
}, { timestamps: true });

const Product = mongoose.model('Products', productSchema);

module.exports = Product;
