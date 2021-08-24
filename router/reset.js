const express = require("express");
const router = express.Router();
//controller import
const reset = require("../controllers/reset");
//helper import
const canReset = require("../helpers/validateUser");
const userValidator = require("../validation/user");
router.post("/user/reset", canReset, reset.resetPassword);
router.post("/user/change", canReset, reset.changePassword);
router.post(
  "/update",
  userValidator.validateUserForPasswordUpdate,
  reset.updatePassword
);
module.exports = router;
