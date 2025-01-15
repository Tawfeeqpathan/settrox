const Cart = require('../models/cart');
const Product = require('../models/products');
const Coupon = require('../models/coupon');

// Add product to cart
exports.addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    console.log('productIdproductId',productId);

    // Check if product exists
    const product = await Product.find({_id:productId.toString()}); 

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Find or create cart for the user
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, products: [] });
    }

    // Check if the product is already in the cart
    const existingProductIndex = cart.products.findIndex(item => item.productId.toString() === productId);
    console.log('existingProductIndex',existingProductIndex);
    if (existingProductIndex > -1) {
      // If the product is already in the cart, update the quantity
      //cart.products[existingProductIndex].quantity += quantity;
      if(quantity == 0){
          cart.products.splice(existingProductIndex, 1);
      }else{
          cart.products[existingProductIndex].quantity = quantity;
      }
      
    } else {
      // If the product is not in the cart, add it
      cart.products.push({ productId, quantity });
    }
    if(cart.products.length == 0){
        await Cart.deleteOne({userId:userId.toString()});
    }else{
        // Save the cart
        await cart.save();
    }
   
    if(quantity == 0){
      res.status(200).json({ message: 'Product removed from cart' });  
    }else{
      res.status(200).json({ message: 'Product added to cart', cart });
    }
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const calculateDiscountPrice = async (originalPrice, couponId) => {
  try {
    // Fetch the coupon details from the database
    const coupon = await Coupon.findById(couponId);

    if (!coupon) {
      throw new Error('Invalid coupon ID.');
    }

    const { discountType, discountValue } = coupon;

    let discountedPrice;

    // Apply discount based on type
    if (discountType === 'percentage') {
      if (discountValue > 100 || discountValue <= 0) {
        throw new Error('Invalid discount percentage.');
      }
      discountedPrice = originalPrice - (originalPrice * discountValue) / 100;
    } else if (discountType === 'fixed') {
      if (discountValue < 0) {
        throw new Error('Invalid fixed discount value.');
      }
      discountedPrice = originalPrice - discountValue;
    } else {
      throw new Error('Unknown discount type.');
    }

    // Ensure the discounted price is not negative
    discountedPrice = Math.max(discountedPrice, 0);

    return {
      originalPrice,
      discountedPrice,
      discountApplied: originalPrice - discountedPrice,
    };
  } catch (error) {
    throw new Error(error.message || 'Error calculating discount price.');
  }
};

// Get the current cart
exports.getCart = async (req, res) => {
  try {
    const { userId,couponCode='' } = req.body;  
     

    // Fetch the user's cart
    const cart = await Cart.findOne({userId:userId.toString()}).populate({
      path: 'products.productId',  
      model: 'Products',          // Model to use for population
      select: 'title image price originalPrice stock'     
    });
     
    if (!cart) {
      return res.status(200).json({ message: 'Cart not found for the user.' });
    }

    let discount = 0;
    let discountType = null;
    let discountValue = null;
    console.log('cart.products',cart);
    if (couponCode) {
      // Check if the coupon is valid
      const coupon = await Coupon.findOne({ couponCode: couponCode, isExpired: false });

      if (!coupon) {
        return res.status(400).json({ message: 'Invalid or expired coupon code.' });
      }

      // Calculate discount based on the coupon type
      discountType = coupon.discountType;
      discountValue = coupon.discount;
      console.log('cart.products',cart.products); 

      const cartTotal = await Promise.all(
        cart.products.map(async (item) => {
          // Fetch product details 
            return item.productId.price * item.quantity; 
        })
      );

      if (discountType === 'percentage') {
        discount = (cartTotal * discountValue) / 100;
      } else if (discountType === 'fixed') {
        discount = discountValue;
      }
    }

 
    const cartTotal = await Promise.all(
      cart.products.map(async (item) => {   
          return item.productId.price * item.quantity; 
      })
    );

    // Calculate the total sum 
    const totalAfterDiscount = Math.max(cartTotal - discount, 0);
   
    res.status(200).json({
      message: 'Cart fetched successfully!', 
      products: cart.products.map(item => ({
        productId: item.productId._id,
        title: item.productId.title,
        image: item.productId.image,
        price: item.productId.price,
        quantity: item.quantity,
        stock: item.productId.stock,
        originalPrice: item.productId.originalPrice
        
      })),
      cartTotal,
      discount: parseFloat(discount.toFixed(3)) || 0,
      totalAfterDiscount, 
      coupon: couponCode
        ? {
            code: couponCode,
            discountType,
            discountValue,
          }
        : null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Remove item from the cart
exports.removeFromCart = async (req, res) => {
  const { userId, productId } = req.body;

  try {
    // Find the user's cart
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Remove the product from the cart
    cart.products = cart.products.filter(item => item.productId.toString() !== productId);

    // Save the updated cart
    await cart.save();

    res.status(200).json({ message: 'Product removed from cart', cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
