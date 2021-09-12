const express = require("express");
const router = express.Router();
const getNUsers = require("../controllers/GET/getNoOfUsers");
const userlistController = require("../controllers/GET/userslist");
const userInfoController = require("../controllers/GET/userInfo");
const userValidator = require("../validation/user");
const profileDetailsController = require("../usergetControllers/profiledata");
const referralDetailsController = require("../usergetControllers/referrals");
const notificationsController = require("../usergetControllers/notifications");

const schoolController = require("../usergetControllers/school");
const transactionController = require("../controllers/transaction");
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
  notificationsController.getNotifications
);
router.get(
  "/schools",
  userValidator.validateUser,
  schoolController.getUniversities
);
router.get(
  "/school/faculty",
  userValidator.validateUser,
  schoolController.getFaculty
);
router.get(
  "/school/faculty/department",
  userValidator.validateUser,
  schoolController.getDepartment
);
router.get(
  "/school/faculty/department/levels",
  userValidator.validateUser,
  schoolController.getDepartmentLevels
);
router.get(
  "/pastquestions",
  userValidator.validateUser,
  schoolController.getPastquestions
);
router.get(
  "/transactions",
  userValidator.validateUser,
  transactionController.getTransactions
);
module.exports = router;
