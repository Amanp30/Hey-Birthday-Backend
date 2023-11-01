const express = require("express");
const {
  getAccountSettings,
  updateAccountDetails,
  newBirthday,
  getOneBirthday,
  updateOneBirthday,
  deleteOneBirthday,
  getBirthdayList,
  getDashboardData,
} = require("../../controllers/appController/appController");
const { requireAuth } = require("../../utilities/Accounts/ValidateToken");

const router = express.Router();

router.get("/account-details/:id", requireAuth, getAccountSettings);
router.post("/account-details/update/:id", requireAuth, updateAccountDetails);

// birthday routes
router.get("/birthday-list/:userid", requireAuth, getBirthdayList);
router.get("/dashboard-data/:userid", requireAuth, getDashboardData);

router.get("/birthday/:id", requireAuth, getOneBirthday);
router.post("/birthday/new/:id", requireAuth, newBirthday);
router.post("/birthday/update/:id/:userid", requireAuth, updateOneBirthday);

router.get("/birthday/delete/:id/:userid", requireAuth, deleteOneBirthday);

module.exports = router;
