const { CustomError } = require("../../CustomError");

/**
 * Validates a password for its strength.
 *
 * @param {string} password - The password to validate.
 * @throws {Error} Throws an error with a specific message if validation fails.
 * @returns {boolean} Returns true if the password is valid.
 */
function validatePassword(password) {
  const minLength = 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\-]/.test(password);

  if (password.length < minLength) {
    throw new CustomError("Password must be at least 8 characters long.");
  } else if (!hasUppercase) {
    throw new CustomError(
      "Password must contain at least one uppercase letter."
    );
  } else if (!hasLowercase) {
    throw new CustomError(
      "Password must contain at least one lowercase letter."
    );
  } else if (!hasDigit) {
    throw new CustomError("Password must contain at least one digit.");
  } else if (!hasSpecialChar) {
    throw new CustomError(
      "Password must contain at least one special character."
    );
  }

  return true;
}

module.exports = validatePassword;
