const {
  ENVIROMENT,
  DEV_CLIENT_URL,
  PROD_CLIENT_URL,
} = require("../../ConfigVariables");

const Allowedurl =
  ENVIROMENT !== "production" ? DEV_CLIENT_URL : PROD_CLIENT_URL;

exports.corsOptions = {
  origin: [
    "https://hey-birthday.vercel.app/",
    Allowedurl,
    "http://localhost:3000",
    "https://amanpareek.link",
  ],
  credentials: true,
  optionSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE"],
};

exports.crossOriginResourceSharing = function (req, res, next) {
  res.header("Access-Control-Allow-Origin", [
    "https://hey-birthday.vercel.app/",
    Allowedurl,
    "http://localhost:3000",
    "https://amanpareek.link",
  ]);
  res.header(
    "Access-Control-Allow-Headers",
    "X-Requested-With, Content-Type, Origin, Authorization, Accept, Client-Security-Token, Accept-Encoding"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
};
