const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chat");
const validator = require("../validation/user");
router.get(
  "/get/group/details",
  validator.validateUser,
  chatController.getGroupChatDetails
);
router.post(
  "/send/message",
  validator.validateUserOnPostRequest,
  chatController.sendChatMessage
);
router.post("/send/group/media",chatController.imageUploader,validator.validateUserOnPostRequest,chatController.sendChatMedia)
router.post("/get/offline/messages",validator.validateUserOnPostRequest,chatController.getOfflineMessages)

module.exports = router;
