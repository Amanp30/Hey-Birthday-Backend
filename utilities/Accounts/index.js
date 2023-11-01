const bcrypt = require("bcrypt");

/**
 * Verify a user's password during login.
 * @param {string} enteredPassword - The password entered by the user during login.
 * @param {string} hashedPassword - The hashed password stored in the database.
 * @returns {Promise<boolean>} - A Promise that resolves to true if the passwords match, false otherwise.
 */
async function verifyPassword(enteredPassword, hashedPassword) {
  try {
    const isPasswordValid = await bcrypt.compare(
      enteredPassword,
      hashedPassword
    );
    return isPasswordValid;
  } catch (error) {
    throw error;
  }
}

module.exports = verifyPassword;
