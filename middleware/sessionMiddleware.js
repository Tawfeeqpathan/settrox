// /middleware/sessionMiddleware.js

// Middleware to check if user is authenticated (session-based)
const isAuthenticated = (req, res, next) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    next();
  };
  
  // Middleware to ensure that the user has a valid session for login
  const checkSession = (req, res, next) => {
    if (req.session.userId) {
      return res.status(400).json({ message: 'Already logged in' });
    }
    next();
  };
  
  module.exports = { isAuthenticated, checkSession };
  