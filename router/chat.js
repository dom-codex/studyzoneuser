const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chat");
const validator = require("../validation/user");
const {verifyUser,verifyUserOnMediaUpload} = require("../verification/userVerification")
router.get(
  "/get/group/details",
  validator.validateUser,
  chatController.getGroupChatDetails
);
router.post(
  "/send/message",
  verifyUser,
  chatController.sendChatMessage
);
router.post("/send/group/media",chatController.imageUploader,verifyUserOnMediaUpload,chatController.sendChatMedia)
router.post("/get/offline/messages",verifyUser,chatController.getOfflineMessages)
router.post("/get/group/offline/messages",verifyUser,chatController.getGroupOfflineMessages)
module.exports = router;
