const express = require("express");
const router = express.Router();
//controllers import
const userAuth = require("../controllers/userAuth");
//validator imports
const signUpValidator = require("../helpers/signUpValidator");
router.post("/user/signup", signUpValidator, userAuth.signUp);
module.exports = router;
