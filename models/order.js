// models/order.js
const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  couponId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserCoupon', required: false },
  shipAddressId: { type: mongoose.Schema.Types.ObjectId, ref: 'Address', required: false },
  billAddressId: { type: mongoose.Schema.Types.ObjectId, ref: 'Address', required: false },
  method: { type: String, enum: ["Card", "Cash"], required: false, default: 'Cash' },
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      variantId: { type: mongoose.Schema.Types.ObjectId, },
      title:{type:String},
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },  // Store price at the time of order
    },
  ],
  discountPrice: { type: Number, required: false, default: '0' },
  totalPrice: { type: Number, required: true },
  status: { type: String, enum: ['preOrder','pending', 'shipped', 'completed', 'cancelled'], default: 'pending' },
  remainingAmount:{type:Number,default:0},
  createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;
