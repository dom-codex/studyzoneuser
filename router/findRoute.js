const express = require("express");
const router = express.Router();
const userController = require("../validation/user");
router.post("/user", userController.findAUser);
module.exports = router;
