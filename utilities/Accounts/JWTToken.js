const jwt = require("jsonwebtoken");

/**
 * Generate a JWT token with user data.
 * @param {Object} userData - User data to include in the token payload.
 * @returns {string} - The JWT token.
 */

function generateToken(userData) {
  const secretKey = process.env.JWT_SECRET;
  const token = jwt.sign(userData, secretKey, { expiresIn: "1d" });
  return token;
}

module.exports = generateToken;
