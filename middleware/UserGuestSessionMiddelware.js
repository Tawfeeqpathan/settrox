const { v4: uuidv4 } = require('uuid'); // to generate unique guest ID

const sessionManager = (req, res, next) => {
  // If user is authenticated, save userId in session
  if (req.session.userId) {
    req.session.type = 'user';
    return next();
  }

  // If no userId, create a guest session
  if (!req.session.guestId) {
    req.session.guestId = uuidv4(); // Generate a unique guest ID
    req.session.type = 'guest';
  }

  next();
};

module.exports = sessionManager;
