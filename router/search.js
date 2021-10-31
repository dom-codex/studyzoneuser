const express = require("express");
const { searchSchool } = require("../controllers/search");
const { validateUser } = require("../validation/user");
const router = express.Router();
router.get("/schools", validateUser, searchSchool);
module.exports = router;
