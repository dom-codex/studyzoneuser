const express = require("express");
const router = express.Router();
const getNUsers = require("../controllers/GET/getNoOfUsers");
const userlistController = require("../controllers/GET/userslist");
const userInfoController = require("../controllers/GET/userInfo");
const userValidator = require("../validation/user");
const profileDetailsController = require("../usergetControllers/profiledata");
const referralDetailsController = require("../usergetControllers/referrals");
const notificationsController = require("../usergetControllers/notifications");
router.get("/users/number", getNUsers);
router.get("/users", userlistController);
router.get("/referrals", userInfoController.getUserReferralList);
router.get(
  "/user/details",
  userValidator.validateUser,
  profileDetailsController
);
router.get(
  "/user/referrals",
  userValidator.validateUser,
  referralDetailsController
);
router.get(
  "/user/notifications",
  userValidator.validateUser,
  notificationsController
);
module.exports = router;
