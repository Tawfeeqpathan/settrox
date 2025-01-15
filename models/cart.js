const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
  userId: {
    type: String, required: false
  },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Products',
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
    },
  ],
});

module.exports = mongoose.model('Cart', CartSchema);
