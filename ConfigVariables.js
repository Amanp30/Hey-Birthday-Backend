const ENVIROMENT = process.env.NODE_ENV;

const MONGO_URI =
  ENVIROMENT === "production"
    ? process.env.MONGO_PRODUCTION
    : process.env.MONGO_LOCAL;

module.exports = { MONGO_URI, ENVIROMENT };
