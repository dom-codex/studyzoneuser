const express = require("express");
const router = express.Router();
//controllers
const userUploads = require("../controllers/userUploads");
//helpers import
const bankDetailsValidation = require("../helpers/bankDetailsVerification");
const {extractWithMulter,checkForTestimony,uploadTestimony} = require("../controllers/testimony");
const {verifyUser} = require("../verification/userVerification")
router.post("/user/bank",verifyUser, userUploads.setBankDetails);
router.post(
  "/user/testimony",
  (req, res, next) => {
    try {
      extractWithMulter(req, res, (e) => {
        if (!e) {
          return next();
        }
        res.status(401).json({
          message: e.message,
          code: 401,
        });
      });
    } catch (e) {
      console.log(e);
      res.status(500).json({
        message:"an error occurred"
      });
    }
  },
  verifyUser,
  checkForTestimony,  
  uploadTestimony
  //userValidator.validateUserOnPostRequest,
  //testimonyController.extractWithMulter,
);
module.exports = router;
