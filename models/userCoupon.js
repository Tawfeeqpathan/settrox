const mongoose = require('mongoose');
const { Schema } = mongoose;

const userCouponSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'users',  // Assuming you have a User collection
    required: true
  },
  couponId: {
    type: Schema.Types.ObjectId,
    ref: 'Coupon',
    required: true
  },
  discountPrice: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const UserCoupon = mongoose.model('UserCoupon', userCouponSchema);

module.exports = UserCoupon;
