const express = require("express");
const router = express.Router();
const notification = require("../controllers/notifications");
const notificationHandler = require("../usergetControllers/notifications");
const userValidator = require("../validation/user");
router.get(
  "/all",
  userValidator.validateUser,
  notification.getAllNotifications
);
router.post(
  "/post",
  userValidator.validateUserOnPostRequest,
  notification.processNotificationFromAdmin
);
router.get(
  "/get/announcements",
  userValidator.validateUser,
  notificationHandler.getAnnouncements
);
router.post("/announcement", notification.newAnnouncement);
module.exports = router;
