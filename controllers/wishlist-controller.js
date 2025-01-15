const Wishlist = require('../models/wishlist');
const Product = require('../models/products');

// Add/Remove product to wishlist
exports.addRemoveToWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.body;
    console.log('productId',productId);
    // Check if product exists
    const product = await Product.findById(productId);
    console.log('product',product);
    if (!product) {
      //return res.status(404).json({ message: 'Product not found' });
    }

    // Find or create wishlist for the user
    let wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      wishlist = new Wishlist({ userId, products: [] });
    }

    // Check if the product is already in the wishlist
    const existingProductIndex = wishlist.products.findIndex(item => item.productId.toString() === productId);

    if (existingProductIndex > -1) {

      // Remove the product from the wishlist
       //wishlist.products = wishlist.products.filter(item => item.productId.toString() !== productId);

      // If the product is already in the wishlist, remove it
      wishlist.products.splice(existingProductIndex, 1);

      // Check if the products array is empty
      if (wishlist.products.length === 0) {
        // If the array is empty, remove the wishlist document
        await Wishlist.deleteOne({ userId: userId }); 
      } 

      res.status(200).json({ message: 'Product removed from wishlist', wishlist });

    } else {
      // If the product is not in the wishlist, add it
      wishlist.products.push({ productId });

      // Save the wishlist
      await wishlist.save();

      res.status(200).json({ message: 'Product added to wishlist', wishlist });
    }
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get the current wishlist
exports.getWishlist = async (req, res) => {
  const { userId } = req.body;

  try {
    console.log('userId',userId)
   
    const wishlist = await Wishlist.findOne({ userId });
    
    if (!wishlist) {
      return res.status(200).json({ message: 'Wishlist is empty' });
    }

    res.status(200).json({ wishlist });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
 
