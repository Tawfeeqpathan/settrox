const mongoose = require('mongoose');
const { Schema } = mongoose;


const brandSchema = new Schema({
  name: {
    type: Map,
    of: String, // Store different language names as key-value pairs
    required: true,
  },
  slug: {
    type: String,
    required: false,
    lowercase: true,
    trim: true,
  },
  description: {
    type: Map,
    of: String, // Store different language names as key-value pairs
    required: false, 
  }, 
  categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Categories', // Assuming the categories are stored in a Category model
      },
  ],
  image: {
    type: String,  // URL or path to the image
    required: false,  // Ensure image is provided
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'], 
    default: 'active',  // Default status is active
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

 

const Brand = mongoose.model('Brand', brandSchema);

module.exports = Brand;
