const Cart = require('../models/cart');
const Product = require('../models/products');
const Coupon = require('../models/coupon');

// Add product to cart
exports.addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity, variantId, subVariant } = req.body;

    // Fetch product details
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // If variantId is provided, fetch the corresponding variant
    let variantDetails = null;
    if (variantId) {
      variantDetails = product.variants.find(variant => variant._id.toString() === variantId);
      if (!variantDetails) {
        return res.status(404).json({ message: 'Variant not found' });
      }
    }

    const price = variantDetails ? variantDetails.price : product.price;
    const stock = variantDetails ? variantDetails.quantity : product.stock;

    if (quantity > stock) {
      return res.status(400).json({ message: 'Requested quantity exceeds stock availability.' });
    }

    // Find or create cart for the user
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, products: [] });
    }

    // Check if the product is already in the cart
    const existingProductIndex = cart.products.findIndex(
      item =>
        item.productId.toString() === productId &&
        (!variantId || item.variantId?.toString() === variantId)
    );

    if (existingProductIndex > -1) {
      // If the product is already in the cart, update the quantity
      if (quantity === 0) {
        cart.products.splice(existingProductIndex, 1); // Remove the product if quantity is 0
      } else {
        cart.products[existingProductIndex].quantity = quantity;
      }
    } else {
      // If the product is not in the cart, add it
      cart.products.push({ productId, quantity, variantId, subVariant });
    }

    if (cart.products.length === 0) {
      await Cart.deleteOne({ userId: userId.toString() });
    } else {
      await cart.save(); // Save the cart
    }

    const message = quantity === 0 ? 'Product removed from cart' : 'Product added to cart';
    res.status(200).json({ message, cart });
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
    const { userId, couponCode = '' } = req.body;

    // Fetch the user's cart
    const cart = await Cart.findOne({ userId: userId.toString() }).populate({
      path: 'products.productId',
      model: 'Products',
      select: 'title image price originalPrice stock variants',
    });

    if (!cart) {
      return res.status(200).json({ message: 'Cart not found for the user.' });
    }

    let discount = 0;
    let discountType = null;
    let discountValue = null;

    if (couponCode) {
      // Fetch and validate coupon
      const coupon = await Coupon.findOne({ couponCode, isExpired: false });
      if (!coupon) {
        return res.status(400).json({ message: 'Invalid or expired coupon code.' });
      }

      discountType = coupon.discountType; // 'percentage' or 'fixed'
      discountValue = coupon.discount; // e.g., 10% or $50
    }

    let cartTotal = 0;
    const productsWithDetails = cart.products.map(item => {
      const product = item.productId;
      const variantDetails = item.variantId
        ? product.variants.find(variant => variant._id.toString() === item.variantId.toString())
        : null;
        const subVariant = item.subVariant; 
      const price = variantDetails ? variantDetails.price : product.price;
      const quantity = item.quantity;
      const stock = variantDetails ? variantDetails.quantity : product.stock;

      // Calculate the total price for this product
      const productTotal = price * quantity;
      cartTotal += productTotal;
      return {
        productId: product._id,
        title: `${product?.title?.get('en')} (${variantDetails?.attributeName?.split('-')[0] || ''},${subVariant||''})`,
        image: product.image,
        price,
        quantity,
        stock,
        variantId: variantDetails ? variantDetails._id : null,
        total: productTotal,
      };
    });

    // Apply coupon discount
    if (discountType === 'percentage') {
      discount = (cartTotal * discountValue) / 100;
    } else if (discountType === 'fixed') {
      discount = discountValue;
    }

    // Ensure discount does not exceed cart total
    discount = Math.min(discount, cartTotal);
    const grandTotal = cartTotal - discount;

    return res.status(200).json({
      cart: productsWithDetails,
      cartTotal,
      discount,
      discountType,
      discountValue,
      grandTotal,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred while fetching the cart.' });
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
