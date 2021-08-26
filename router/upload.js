const express = require("express");
const router = express.Router();
const multer = require("multer");
//controllers
const userUploads = require("../controllers/userUploads");
//helpers import
const bankDetailsValidation = require("../helpers/bankDetailsVerification");
const userValidator = require("../validation/user");
const testimonyController = require("../controllers/testimony");
router.post("/user/bank", bankDetailsValidation, userUploads.setBankDetails);
router.post(
  "/user/testimony",
  (req, res, next) => {
    try {
      testimonyController.extractWithMulter(req, res, (e) => {
        if (!e) {
          return next();
        }
        res.json({
          message: e.message,
          code: 402,
        });
      });
    } catch (e) {
      console.log(e);
      res.status(500).end();
    }
  },
  userValidator.validateUserOnPostRequest,
  testimonyController.extractWithMulter,
  testimonyController.uploadTestimony
);
module.exports = router;
