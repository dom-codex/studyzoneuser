const express = require("express");
const router = express.Router();
const userValidator = require("../validation/user");
const downloadController = require("../controllers/pqDownload");
const downloadValidator = require("../validation/downloadsRequest");
const { downloadAPastQuestion } = require("../controllers/pqDownload");
const { verifyUser } = require("../verification/userVerification");
const {
  checkForExistingTransactions,
  verifyPayment,
} = require("../verification/transaction");
/*router.post(
  "/prepare",
  userValidator.validateUser,
  downloadValidator.validateUserRequestState,
  downloadController.prepareDownloads
);*/
//router.post("/pastquestion", downloadController.downloadPastQuestion);
router.post("/pastquestion", verifyUser, verifyPayment, downloadAPastQuestion);
module.exports = router;
