const {
  getListData,
  newListData,
  importListNow,
  yourLists,
  deleteList,
  increaseAllowLimit,
} = require("../../controllers/ListController");
const { requireAuth } = require("../../utilities/Accounts/ValidateToken");

const router = require("express").Router();

router.get("/list/:userid", requireAuth, getListData);
router.get("/your-lists/:userid", requireAuth, yourLists);
router.get("/delete-list/:id", requireAuth, deleteList);
router.get("/increase-limit/:id/:times", requireAuth, increaseAllowLimit);
router.get("/import-list/:code/:userid", requireAuth, importListNow);

router.post("/new-list/:userid", requireAuth, newListData);

module.exports = router;
