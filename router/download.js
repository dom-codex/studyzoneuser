const express = require("express");
const router = express.Router();
const userValidator = require("../validation/user");
const downloadController = require("../controllers/pqDownload");
const downloadValidator = require("../validation/downloadsRequest");
router.post(
  "/prepare",
  userValidator.validateUser,
  downloadValidator.validateUserRequestState,
  downloadController.prepareDownloads
);
router.post("/pastquestion", downloadController.downloadPastQuestion);
module.exports = router;
