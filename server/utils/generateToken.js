const jwt = require('jsonwebtoken');

// Generate JWT token for authentication
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },  // Payload: data to encode in token
    process.env.JWT_SECRET,  // Secret key to sign token
    { expiresIn: process.env.JWT_EXPIRE }  // Token expiration time
  );
};

module.exports = generateToken;
