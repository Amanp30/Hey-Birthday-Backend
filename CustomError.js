/**
 * CustomError class for creating custom error objects.
 * @param {string} message - The error message.
 * @param {number} statusCode - The HTTP status code for the error (default: 401).
 */
class CustomError extends Error {
  constructor(message, statusCode = 409) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = { CustomError };
