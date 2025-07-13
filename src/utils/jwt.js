const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Generate a JWT token for a user
 * @param {Object} user - User object with id
 * @returns {String} JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRATION || '1d' }
  );
};

/**
 * Verify a JWT token
 * @param {String} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw error;
  }
};

module.exports = {
  generateToken,
  verifyToken,
};