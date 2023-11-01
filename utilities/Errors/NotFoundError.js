const handleNotFound = (req, res, next) => {
  return res.status(404).send({ message: "Requested data not found" });
};

module.exports = handleNotFound;
