// models/coupon.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const couponSchema = new Schema({
  brandId: {
    type: Schema.Types.ObjectId,
    ref: 'Brand',  // Assuming you have a Brand collection
    required: false
  },
  couponCode: {
    type: String,
    required: true,
    unique: true
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'], // Example discount types
    required: true
  },
  discount: {
    type: Number,
    required: true
  },
  isOneTime: {
    type: Boolean,
    default: false
  },
  endDate: {
    type: Date
  },
  isExpired: {
    type: Boolean,
    default: false
  }
});

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
