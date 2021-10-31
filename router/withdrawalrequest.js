const express = require("express");
const router = express.Router();
const userValidator = require("../validation/user");
const testimonyController = require("../controllers/testimony");
const requestController = require("../controllers/withdrawalrequest");
router.post(
  "/request",
  userValidator.validateUserOnPostRequest,
  testimonyController.checkForTestimony,
  requestController.requestWithdrawal
);
router.post("/reverse", requestController.reverseWithdrawal);
module.exports = router;
