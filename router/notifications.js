const express = require("express");
const router = express.Router();
const notification = require("../controllers/notifications");
const notificationHandler = require("../usergetControllers/notifications");
const userValidator = require("../validation/user");
const {verifyUser} = require("../verification/userVerification")
router.get(
  "/all",
  verifyUser,
  notification.getAllNotifications
);
router.post(
  "/post",
  verifyUser,
  notification.processNotificationFromAdmin
);
router.get(
  "/get/announcements",
  verifyUser,
  notificationHandler.getAnnouncements
);
router.post("/announcement", notification.newAnnouncement);
module.exports = router;
