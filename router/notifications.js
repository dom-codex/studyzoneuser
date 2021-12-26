const express = require("express");
const router = express.Router();
const notification = require("../controllers/notifications");
const notificationHandler = require("../usergetControllers/notifications");
const userValidator = require("../validation/user");
const {verifyUser,verifyUserForAdminPostRequest} = require("../verification/userVerification")
router.get(
  "/all",
  verifyUser,
  notification.getAllNotifications
);
router.post(
  "/post",
  verifyUserForAdminPostRequest,
  notification.processNotificationFromAdmin
);
router.get(
  "/get/announcements",
  verifyUser,
  notificationHandler.getAnnouncements
);
router.post("/announcement", notification.newAnnouncement);
module.exports = router;
