const Order = require('../models/order');
const Coupon = require('../models/coupon');
const Cart = require('../models/cart');
const User = require('../models/user');
const Product = require('../models/products');
const bcrypt = require("bcryptjs");

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

// Create an order
exports.createOrder = async (req, res) => {
  try {
    const { userId,couponId } = req.body;
    
    // Find the user's cart
    const cart = await Cart.findOne({ userId });
    
    if (!cart || cart.products.length === 0) {
      return res.status(400).json({ message: 'Your cart is empty. Please add products to your cart.' });
    }

    // Calculate the total price
    let totalPrice = 0;
    const orderProducts = [];

    for (const cartProduct of cart.products) {
      const product = await Product.findById(cartProduct.productId);
      if (!product) {
        return res.status(404).json({ message: `Product with id ${cartProduct.productId} not found.` });
      }

      totalPrice += product.price * cartProduct.quantity;

      orderProducts.push({
        productId: cartProduct.productId,
        quantity: cartProduct.quantity,
        price: product.price,
      });
    }
    let discountPrice = 0;
    if(couponId){
        const discountObj = await calculateDiscountPrice(couponId);
        if (discountObj) {
          discountPrice = discountObj.discountedPrice
        }
        
    }
    let guestId;
        if(req.body.guestId){
          guestId = req.body.guestId
        }else{
          guestId = userId
        }    
    if(guestId){
        
        const existingUser = await User.findOne({ guestId:guestId });
        let userIds;
        if (existingUser) {
          userIds = existingUser._id;
        }else{
          let name = req.body.name;
          let email = req.body.email;
          let phone = req.body.phone_number;
            // Hash the password
            const hashedPassword = await bcrypt.hash('123456', 12); 
            // Create a new user with optional role (default: "user")
            const user = new User({
                name,
                guestId,
                email,
                password: hashedPassword,
                phone,
                role: "guest", // Default role is "user"
            });
            await user.save();
            userIds = user._id;
          }  
            const userObj = await User.findById(userIds); 
            let shipAddress = {};
            shipAddress.label = "Ship";
            shipAddress.street = req.body.street;
            shipAddress.city = req.body.city;
            shipAddress.state = req.body.state;
            shipAddress.country = req.body.country;
            shipAddress.zipcode = req.body.zipcode; 

            userObj.addresses.push(shipAddress);
            // Get the newly added address ID
            const shipAddressId = userObj.addresses[userObj.addresses.length - 1]._id;
            await userObj.save();

            const userBillObj = await User.findById(userIds); 
            
            let billAddress = {};
            billAddress.label = "Ship";
            billAddress.street = req.body.bill_street;
            billAddress.city = req.body.bill_city;
            billAddress.state = req.body.bill_state;
            billAddress.country = req.body.bill_country;
            billAddress.zipcode = req.body.bill_zipcode; 

            userBillObj.addresses.push(billAddress);
            // Get the newly added address ID
            const billAddressId = userBillObj.addresses[userBillObj.addresses.length - 1]._id;
            await userBillObj.save();

            // Create the order
            const order = new Order({
              userId:userIds,
                  couponId,
                  shipAddressId,
                  billAddressId,
                  products: orderProducts,
                  discountPrice,
                  totalPrice,
                  status: 'pending', // Default status
            });

            await order.save(); 
            // Clear the cart after creating the order
            await Cart.findOneAndDelete({ userId });
            
            res.status(201).json({ message: 'Order created successfully', order });
       
    }
   

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
};

// Get orders by user ID
exports.getOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.body; 
    const orders = await Order.find({userId:userId.toString()}).populate({
      path: 'products.productId',  
      model: 'Products',          // Model to use for population
      select: 'title image price originalPrice stock'     
    });
      
    
    if (!orders || orders.length === 0) {
      return res.status(200).json({ message: 'No orders found for this user.' });
    }
    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};

// getOrderById
exports.getOrderById = async (req, res) => {
  try {
    const { userId,orderId } = req.body; 
    const orders = await Order.find({userId:userId.toString(),_id:orderId.toString()}).populate({
      path: 'products.productId',  
      model: 'Products',          // Model to use for population
      select: 'title image price originalPrice stock'     
    });
      
    
    if (!orders || orders.length === 0) {
      return res.status(200).json({ message: 'No orders found for this user.' });
    }
    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};

// Update order status
exports.index = async (req, res) => {
  try {
    const { customerName,
      status,
      day,
      page = 1,
      limit = 20,
      startDate,
      endDate,
      method, } = req.query;

    // Prepare pagination
    const skip = (page - 1) * limit;
    const paginationOptions = {
      skip,
      limit: parseInt(limit),
    };

    // Build the filter query dynamically
    let filter = {};

    // Filter by status
    if (status) {
      filter.status = status;
    }
  
    // Get filtered orders with pagination
    const orders = await Order.find(filter).populate({
      path: 'userId',   // Populate single category
      select: 'name _id', // Include only the 'name' and '_id' fields from Category
    })
      .skip(paginationOptions.skip)
      .limit(paginationOptions.limit);

    // Get the total count of matching orders for pagination
    const totalDoc = await Order.countDocuments(filter);
    
    // Send the response with orders and pagination data
    res.status(200).json({
      orders,
      totalDoc,  // Total number of matching products
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['pending', 'shipped', 'completed', 'cancelled'];

    // Validate the status
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Allowed values are: pending, shipped, completed, cancelled.' });
    }

    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    res.status(200).json({ message: 'Order status updated successfully', order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating order status', error: error.message });
  }
};
