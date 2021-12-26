const express = require("express");
const router = express.Router();
//controllers import
const userAuth = require("../controllers/userAuth");
//validator imports
const signUpValidator = require("../helpers/signUpValidator");
const loginValidator = require("../helpers/loginValidator");
const resetController = require("../controllers/reset")
const validator = require("../validation/user")
router.post("/user/signup", signUpValidator, userAuth.signUp);
router.post("/user/login", loginValidator, userAuth.login);
router.post("/user/account/activation", userAuth.activateAccount);
router.post("/user/status/toggle", userAuth.toggleUserStatus);
router.post("/reset/device",resetController.resetDeviceId)
router.post("/set/device",resetController.setNewDeviceId)
router.post("/user/logout",userAuth.logout)
router.post("/user/validate",validator.validateUserDeviceAndStatus)
module.exports = router;
