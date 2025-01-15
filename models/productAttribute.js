// models/productAttribute.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const VariantSchema = new mongoose.Schema({
  name: {
    type: Map,
    of: String, // Store different language names as key-value pairs
    required: true,
  },
  status: {
    type: String,
    lowercase: true,
    enum: ['show', 'hide'],
    default: 'show',
  },
});

const productAttributeSchema = new Schema({
  name: {
    type: Map,
    of: String, // Store different language names as key-value pairs
    required: true,
  },
  title: {
    type: Map,
    of: String, // Store different language names as key-value pairs
    required: true,
  },
  option: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  variants: [VariantSchema],
  status: {
    type: String,
    lowercase: true,
    enum: ['show', 'hide'],
    default: 'show',
  }, 
});

const ProductAttribute = mongoose.model('ProductAttribute', productAttributeSchema);

module.exports = ProductAttribute;
