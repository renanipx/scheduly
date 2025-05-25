const passport = require('passport');

// Middleware to check if user is authenticated
const isAuthenticated = passport.authenticate('jwt', { session: false });

// Middleware to check if user is admin (you can add more roles as needed)
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied' });
  }
};

module.exports = {
  isAuthenticated,
  isAdmin
}; 