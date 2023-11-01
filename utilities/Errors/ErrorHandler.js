const handleEveryError = (error, req, res, next) => {
  console.error("Error:", error);

  const statusCode = error.statusCode || 500;

  const errorMessage =
    statusCode === 500 ? "Internal Server Error" : error.message;

  const errorResponse = {
    message: errorMessage,
    error: {
      code: error.statusCode || "UNKNOWN_ERROR",
      message: error.message,
    },
  };

  res.status(statusCode).json(errorResponse);
};

module.exports = handleEveryError;
