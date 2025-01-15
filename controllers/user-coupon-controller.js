const UserCoupon = require('../models/userCoupon'); // Adjust the path as needed

// Controller to create a new user coupon
exports.createUserCoupon = async (req, res) => {
    try {
        const { userId, couponId, discountPrice } = req.body;

        if (!userId || !couponId || discountPrice == null) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const userCoupon = new UserCoupon({ userId, couponId, discountPrice });
        await userCoupon.save();

        res.status(201).json({ message: 'User coupon created successfully', userCoupon });
    } catch (error) {
        console.error('Error creating user coupon:', error);
        res.status(500).json({ error: 'An internal server error occurred' });
    }
};

// Controller to fetch all user coupons
exports.getAllUserCoupons = async (req, res) => {
    try {
        const userCoupons = await UserCoupon.find()
            .populate('userId', 'name email') 
            .populate('couponId', 'code discount');

        res.status(200).json({ userCoupons });
    } catch (error) {
        console.error('Error fetching user coupons:', error);
        res.status(500).json({ error: 'An internal server error occurred' });
    }
};

// Controller to delete a user coupon by ID
exports.deleteUserCoupon = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedCoupon = await UserCoupon.findByIdAndDelete(id);

        if (!deletedCoupon) {
            return res.status(404).json({ error: 'User coupon not found' });
        }

        res.status(200).json({ message: 'User coupon deleted successfully', deletedCoupon });
    } catch (error) {
        console.error('Error deleting user coupon:', error);
        res.status(500).json({ error: 'An internal server error occurred' });
    }
};

// Controller to find coupons by user ID
exports.getCouponsByUserId = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const userCoupons = await UserCoupon.find({ userId })
            .populate('couponId', 'code discount') 
            .populate('userId', 'name email'); 

        if (!userCoupons || userCoupons.length === 0) {
            return res.status(404).json({ message: 'No coupons found for this user' });
        }

        res.status(200).json({ userCoupons });
    } catch (error) {
        console.error('Error fetching coupons by user ID:', error);
        res.status(500).json({ error: 'An internal server error occurred' });
    }
};
