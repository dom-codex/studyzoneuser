const express = require("express");
const router = express.Router();
//controllers import
const userAuth = require("../controllers/userAuth");
//validator imports
const signUpValidator = require("../helpers/signUpValidator");
const loginValidator = require("../helpers/loginValidator");
router.post("/user/signup", signUpValidator, userAuth.signUp);
router.post("/user/login", loginValidator, userAuth.login);
module.exports = router;
