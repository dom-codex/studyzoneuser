const express = require("express");
const router = express.Router();
const validator = require("../validation/user");
const supportController = require("../controllers/support");
router.post(
  "/send/email",
  validator.validateUserOnPostRequest,
  supportController.sendEmailToAdmin
);
router.post(
  "/send/message/to/admin",
  validator.validateUserOnPostRequest,
  supportController.sendChatToAdmin
);
router.post("/send/message/to/user", supportController.receiveMessageFromAdmin);
router.post(
  "/send/chat/media",
  supportController.imageUploader,
  validator.validateUserOnPostRequest,
  supportController.sendMediaMessageToAdmin
);
module.exports = router;
