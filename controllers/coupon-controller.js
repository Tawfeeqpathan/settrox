const Coupon = require('../models/coupon'); // Import the Coupon model

// Method to add a new coupon
exports.addCoupon = async (req, res) => {
  try {
    const { brandId, couponCode, discountType, discount, isOneTime, endDate, isExpired } = req.body;

    // Validate endDate is a valid date and not in the past
    const parsedEndDate = new Date(endDate);
    if (isNaN(parsedEndDate.getTime()) || parsedEndDate < new Date()) {
      return res.status(400).json({ message: 'Invalid or past end date.' });
    }

    // Check if the coupon code already exists
    const existingCoupon = await Coupon.findOne({ couponCode });
    if (existingCoupon) {
      return res.status(400).json({ message: 'Coupon code already exists.' });
    }

    // Create a new coupon document
    const newCoupon = new Coupon({
      brandId: brandId || null, // If brandId is not provided, set it to null
      couponCode,
      discountType,
      discount,
      isOneTime: isOneTime || false,
      endDate:parsedEndDate,
      isExpired: isExpired || false,
    });

    // Save the coupon to the database
    await newCoupon.save();
    res.status(201).json({ message: 'Coupon added successfully', coupon: newCoupon });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding coupon', error: error.message });
  }
};

// Method to update an existing coupon
exports.updateCoupon = async (req, res) => {
  try {
    const couponId = req.params.id; // Get couponId from URL
    const updateData = req.body; // The updated data to be applied

    // Find and update the coupon
    const updatedCoupon = await Coupon.findByIdAndUpdate(couponId, updateData, { new: true });

    if (!updatedCoupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    res.status(200).json({ message: 'Coupon updated successfully', coupon: updatedCoupon });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating coupon', error: error.message });
  }
};

// Method to delete a coupon
exports.removeCoupon = async (req, res) => {
  try {
    const couponId = req.params.id;

    // Find and delete the coupon
    const deletedCoupon = await Coupon.findByIdAndDelete(couponId);

    if (!deletedCoupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    res.status(200).json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting coupon', error: error.message });
  }
};

exports.listCoupons = async (req, res) => {
  try {
    // Get query parameters for pagination
    const { page = 1, limit = 10 } = req.body;

    // Parse page and limit to integers
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    // Calculate skip for pagination
    const skip = (pageNum - 1) * limitNum;
 

    // Query for non-expired coupons
    const filter = { isExpired: false };

    // Fetch coupons with pagination and sorting (optional)
    const coupons = await Coupon.find(filter)
      //.sort({ endDate: 1 }) // Sort by endDate ascending (optional)
      .skip(skip)
      .limit(limitNum);

    // Get the total count of non-expired coupons
    const totalCoupons = await Coupon.countDocuments(filter);

    // Calculate total pages
    const totalPages = Math.ceil(totalCoupons / limitNum);

    res.status(200).json({
      message: 'Coupons fetched successfully!',
      data: {
        coupons,
        totalCoupons,
        totalPages,
        currentPage: pageNum,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
