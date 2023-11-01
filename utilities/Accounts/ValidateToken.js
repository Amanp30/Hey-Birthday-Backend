const { expressjwt: jwt } = require("express-jwt");
const { CustomError } = require("../../CustomError");

exports.requireAuth = (req, res, next) => {
  jwt({
    secret: process.env.JWT_SECRET,
    algorithms: ["HS256"],
  })(req, res, (err) => {
    try {
      if (err) {
        // Handle unauthorized error
        throw new CustomError("Unauthorized client from server", 401);
      } else {
        // User is authenticated, proceed to the next middleware
        next();
      }
    } catch (error) {
      next(error);
    }
  });
};
