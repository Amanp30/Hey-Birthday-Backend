const { CustomError } = require("../../CustomError");

function validateEmail(email) {
  const gmailRegex = /^[a-zA-Z0-9._-]+@gmail\.com$/;
  const outlookRegex = /^[a-zA-Z0-9._-]+@outlook\.com$/;

  if (gmailRegex.test(email) || outlookRegex.test(email)) {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

    if (emailRegex.test(email)) {
      return true;
    } else {
      throw new CustomError("Invalid email address.");
    }
  } else {
    throw new CustomError(
      "Email addresses from Gmail or Outlook domains only are accepted."
    );
  }
}

module.exports = validateEmail;
