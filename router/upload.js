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
  verifyUser,
  checkForTestimony,  
  uploadTestimony
  //userValidator.validateUserOnPostRequest,
  //testimonyController.extractWithMulter,
);
module.exports = router;
