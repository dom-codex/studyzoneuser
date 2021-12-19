const express = require("express");
const router = express.Router();
const validator = require("../validation/user");
const supportController = require("../controllers/support");
const {verifyUser}  = require("../verification/userVerification")
router.post(
  "/send/email",
  verifyUser,
  validator.validateUserOnPostRequest,
  supportController.sendEmailToAdmin
);
router.post(
  "/send/message/to/admin",
  verifyUser,
  validator.validateUserOnPostRequest,
  supportController.sendChatToAdmin
);
router.post("/send/message/to/user", supportController.receiveMessageFromAdmin);
router.post(
  "/send/chat/media",
  supportController.imageUploader,
  verifyUser,
  validator.validateUserOnPostRequest,
  supportController.sendMediaMessageToAdmin
);
module.exports = router;
