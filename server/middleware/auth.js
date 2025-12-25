const jwt = require('jsonwebtoken');
const User = require('../models/User');
const UserRole = require('../models/UserRole');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  // Format: "Bearer <token>"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    next();  // Continue to next middleware/route handler
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

// Authorize specific roles
const authorize = (...roles) => {
  return async (req, res, next) => {
    // Get user roles from database
    const userRoles = await UserRole.find({ userId: req.user._id });
    const userRoleNames = userRoles.map(ur => ur.role);

    // Check if user has any of the required roles
    const hasRole = roles.some(role => userRoleNames.includes(role));

    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: `User role(s) ${userRoleNames.join(', ')} not authorized to access this route`
      });
    }

    next();
  };
};

module.exports = { protect, authorize };
