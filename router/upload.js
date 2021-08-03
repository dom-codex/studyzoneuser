const express = require("express");
const router = express.Router();
//controllers
const userUploads = require("../controllers/userUploads");
//helpers import
const bankDetailsValidation = require("../helpers/bankDetailsVerification");
router.post("/user/bank", bankDetailsValidation, userUploads.setBankDetails);
module.exports = router;
