const express = require("express");
const router = express.Router();
const notification = require("../controllers/notifications");
router.get("/all", notification.getAllNotifications);
module.exports = router;
