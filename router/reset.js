const express = require("express");
const router = express.Router();
//controller import
const reset = require("../controllers/reset");
router.post("/user/password", reset.resetPassword);
module.exports = router;
