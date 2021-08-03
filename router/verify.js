const express = require("express");
const router = express.Router();
///controller import
const verify = require("../controllers/verifiyController");
router.post("/user/freetrial", verify.verifyFreeTrial);
module.exports = router;
