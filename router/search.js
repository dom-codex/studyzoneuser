const express = require("express");
const { searchSchool } = require("../controllers/search");
const { validateUser } = require("../validation/user");
const {verifyUser} = require("../verification/userVerification")
const router = express.Router();
router.get("/schools", verifyUser, searchSchool);
module.exports = router;
