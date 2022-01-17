const express = require("express");
const { searchSchool,searchDepartment,searchFaculty, searchUser } = require("../controllers/search");
const {verifyUser} = require("../verification/userVerification")
const router = express.Router();
router.get("/school", verifyUser, searchSchool);
router.get("/faculty", verifyUser, searchFaculty);
router.get("/department", verifyUser, searchDepartment);
router.get("/user", searchUser);
module.exports = router;
