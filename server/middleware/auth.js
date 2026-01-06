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

    // Attach user roles
    const userRoles = await UserRole.find({ userId: req.user._id });
    req.userRoles = userRoles.map(ur => ur.role);
    // For backward compatibility if single role check is used elsewhere (though array is better)
    req.userRole = req.userRoles.includes('admin') ? 'admin' : (req.userRoles.includes('instructor') ? 'instructor' : 'user');

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

// Optional authentication - populate user if token exists, but don't error if not
const optionalProtect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    
    if (req.user) {
      const userRoles = await UserRole.find({ userId: req.user._id });
      req.userRoles = userRoles.map(ur => ur.role);
      req.userRole = req.userRoles.includes('admin') ? 'admin' : (req.userRoles.includes('instructor') ? 'instructor' : 'user');
    }
    
    next();
  } catch (error) {
    // If token invalid, just proceed as guest
    next();
  }
};

module.exports = { protect, authorize, optionalProtect };
