const bcrypt = require("bcryptjs");
const User = require("../models/user");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../services/tokenService");
const { verifyRefreshToken } = require("../middleware/auth");
const jwt = require("jsonwebtoken");
require("dotenv").config(); // To use environment variables

// Register User
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create a new user with optional role (default: "user")
    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      role: role || "user", // Default role is "user"
    });
    await user.save();

    // Save user information in session
    req.session.userId = user._id;
    req.session.name = user.name;
    req.session.email = user.email;
    req.session.role = user.role; // Store role in session

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login User
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Compare the password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect)
      return res.status(400).json({ message: "Invalid credentials" });

    // Save user information in session
    req.session.userId = user._id;
    req.session.name = user.name;
    req.session.email = user.email;
    req.session.role = user.role;

    // Prepare payload for access and refresh tokens
    const payload = {
      userId: user._id,
      email: user.email,
      role: user.role, // Include role in the payload
    };

    // Generate tokens based on the role
    const accessToken = generateAccessToken(payload); // generate a JWT with role
    const refreshToken = generateRefreshToken(payload);

    // Save refresh token in the database (optional)
    user.refreshToken = refreshToken;
    await user.save();

    // Optionally store refresh token in session (if needed)
    req.session.refreshToken = refreshToken;

    // Return the response with tokens and user info
    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role, // Include role in the response
      },
      tokens: { accessToken, refreshToken },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.refreshToken = async (req, res) => {
  // console.log(req.body);
  try {
    const { refreshToken } = req.body;
    console.log(refreshToken);
    if (!refreshToken)
      return res.status(403).json({ message: "Refresh token is required" });

    const decodedData = verifyRefreshToken(refreshToken);

    // Optionally verify refresh token in the database
    const user = await User.findById(decodedData.userId);
    console.log(user.refreshToken);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }
    const payload = { userId: user._id, email: user.email };
    // Generate new access token
    const accessToken = generateRefreshToken(payload);

    res.status(200).json({ message: "Access token refreshed", accessToken });
  } catch (error) {
    console.log("object", error);
    res.status(401).json({ message: "Invalid refresh token" });
  }
};
// Logout User
exports.logoutUser = async (req, res) => {
  const { refreshToken } = req.body;
  const user = await User.findOne({ refreshToken });
  if (!user) return res.status(400).json({ message: "Invalid refresh token" });

  // Invalidate the refresh token
  user.refreshToken = null;
  await User.findByIdAndUpdate(user._id, user);
  req.session.destroy((err) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error logging out", error: err.message });
    }
    res.status(200).json({ message: "Logged out successfully" });
  });
};

exports.getprofile = (req, res) => {
  if (req.session.userId) {
    res.send(`User profile: ${req.session.userId}`);
  } else {
    res.status(401).send("Not logged in");
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Create a password reset token (using JWT here)
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Save the token in the database (optional, you can also send directly to the user)
    user.resetPasswordToken = token;
    await user.save();

    // Send the password reset link via email
    const resetLink = `http://your-frontend-url/reset-password?token=${token}`;

    // Setup email transport using Nodemailer (or any service you prefer)
    // const transporter = nodemailer.createTransport({
    //   service: 'gmail',
    //   auth: {
    //     user: process.env.EMAIL_USER,  // Your email here
    //     pass: process.env.EMAIL_PASS,  // Your email password or App Password
    //   },
    // });

    // const mailOptions = {
    //   from: process.env.EMAIL_USER,
    //   to: user.email,
    //   subject: 'Password Reset Request',
    //   text: `Click the following link to reset your password: ${resetLink}`,
    // };

    // await transporter.sendMail(mailOptions);

    res
      .status(200)
      .json({ message: "Password reset link has been sent to your email." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Something went wrong, please try again later." });
  }
};

// Add Address
exports.addAddress = async (req, res) => {
  const { userId } = req.params;
  const address = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.addresses.push(address);
    await user.save();

    res.status(200).json({ message: "Address added successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Error adding address", error });
  }
};

// Update Address
exports.updateAddress = async (req, res) => {
  const { userId, addressId } = req.params;
  const addressData = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const address = user.addresses.id(addressId);
    if (!address) return res.status(404).json({ message: "Address not found" });

    Object.assign(address, addressData); // Update address fields
    await user.save();

    res.status(200).json({ message: "Address updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Error updating address", error });
  }
};

// Delete Address
exports.deleteAddress = async (req, res) => {
  const { userId, addressId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.addresses.id(addressId).remove();
    await user.save();

    res.status(200).json({ message: "Address deleted successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Error deleting address", error });
  }
};

// Set Default Address
exports.setDefaultAddress = async (req, res) => {
  const { userId, addressId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.addresses.forEach((address) => {
      address.isDefault = address._id.toString() === addressId;
    });

    await user.save();

    res.status(200).json({ message: "Default address set successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Error setting default address", error });
  }
};





