const express = require("express");
const router = express.Router();
const getNUsers = require("../controllers/GET/getNoOfUsers");
const userlistController = require("../controllers/GET/userslist");
const userInfoController = require("../controllers/GET/userInfo");
router.get("/users/number", getNUsers);
router.get("/users", userlistController);
router.get("/referrals", userInfoController.getUserReferralList);
module.exports = router;
