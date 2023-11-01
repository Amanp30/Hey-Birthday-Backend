const express = require("express");
const {
  SignUpController,
  LoginController,
  deleteAccount,
} = require("../../controllers/auth/AuthController");

const router = express.Router();

// router.get("/", HomeController);
router.post("/signup", SignUpController);
router.post("/login", LoginController);
router.get("/delete-account/:userid", deleteAccount);

module.exports = router;
