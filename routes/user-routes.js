const express = require('express');
const { registerUser, loginUser, logoutUser, getprofile, refreshToken, forgotPassword } = require('../controllers/user-controller');

const { checkSession } = require('../middleware/sessionMiddleware');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Public Routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/refresh', refreshToken);
router.post('/logout', logoutUser);
router.post('/forgot-password', forgotPassword);
// Example of a Protected Route
router.get('/profile',auth,getprofile);

module.exports = router;
