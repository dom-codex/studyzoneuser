const express = require("express");
const router = express.Router();
const userValidator = require("../validation/user");
const paymentValidator = require("../validation/payement");
const paymentController = require("../controllers/payment");
router.post(
  "/keypayment",
  userValidator.validateUserForPayment,
  paymentValidator.validatePaymentDetails,
  paymentController.payWithKey
);
router.post(
  "/make/card/payment",
  userValidator.validateUserForPayment,
  paymentValidator.validateCardPayment,
  paymentController.payWithCard
);
router.post(
  "/freetrial",
  userValidator.validateUserForPayment,
  paymentController.freeTrialPayment
);
module.exports = router;
