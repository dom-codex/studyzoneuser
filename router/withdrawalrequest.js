const express = require("express");
const router = express.Router();
const userValidator = require("../validation/user");
const testimonyController = require("../controllers/testimony");
const {reverseWithdrawal,requestWithdrawal,confirmIfCanProceedWithWithdrawal} = require("../controllers/withdrawalrequest");
const {verifyUser} = require("../verification/userVerification")
router.post(
  "/request",
  verifyUser,
  confirmIfCanProceedWithWithdrawal,
  requestWithdrawal
);
router.post("/reverse", reverseWithdrawal);
module.exports = router;
