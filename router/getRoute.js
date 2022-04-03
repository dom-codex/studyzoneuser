const express = require("express");
const router = express.Router();
const getNUsers = require("../controllers/GET/getNoOfUsers");
const userlistController = require("../controllers/GET/userslist");
const userInfoController = require("../controllers/GET/userInfo");
const userValidator = require("../validation/user");
const {getBanks,getProfileData,getUserDetails} = require("../usergetControllers/profiledata");
const referralDetailsController = require("../usergetControllers/referrals");
const notificationsController = require("../usergetControllers/notifications");

const schoolController = require("../usergetControllers/school");
const transactionController = require("../controllers/transaction");
//new
const {
  getPastquestionsOnly,
  getPaymentStatus,
  checkFreeTrialOption,
  getPastQuestionsPrice,
} = require("../usergetControllers/pastquestions");
const { verifyUser } = require("../verification/userVerification");
router.get("/users/number", getNUsers);
router.get("/users", userlistController);
router.get("/referrals", userInfoController.getUserReferralList);
router.get(
  "/user/details",
  verifyUser,
  getProfileData
);
router.get(
  "/user/referrals",
  verifyUser,
  referralDetailsController
);
router.get(
  "/user/notifications",
  verifyUser,
  notificationsController.getNotifications
);
router.get(
  "/schools",
  verifyUser,
  schoolController.getUniversities
);
router.get(
  "/school/faculty",
  verifyUser,
  schoolController.getFaculty
);
router.get(
  "/school/faculty/department",
  verifyUser,
  schoolController.getDepartment
);
router.get(
  "/school/faculty/department/levels",
  verifyUser,
  schoolController.getDepartmentLevels
);
router.get(
  "/pastquestions",
  verifyUser,
  schoolController.getPastquestions
);
router.get(
  "/transactions",
  verifyUser,
  transactionController.getTransactions
);
router.get("/transaction/latest/time",verifyUser,transactionController.getTransactionLatestTime)
router.get("/pastquestions/only",verifyUser ,getPastquestionsOnly);
router.get("/payment/status",verifyUser, getPaymentStatus);
router.get("/freetrial/settings",verifyUser, checkFreeTrialOption);
router.get("/pastquestions/price",verifyUser, getPastQuestionsPrice);
router.get("/banks",verifyUser,getBanks)
router.get("/user/info",getUserDetails)
router.get("/card/settings",verifyUser,transactionController.getCardPaymentSettings)
module.exports = router;
