const express = require("express");
const router = express.Router();
const userValidator = require("../validation/user");
const paymentValidator = require("../validation/payement");
const paymentController = require("../controllers/payment");
const {
  checkForExistingTransactions,
  verifyLisenseKey,
  verifyCardTransaction,
} = require("../verification/transaction");
const {
  activateWithFreeTrial,
  payWithKeyOrCard,
} = require("../controllers/payment");
//to delete
router.post(
  "/keypayment",
  userValidator.validateUserForPayment,
  paymentValidator.validatePaymentDetails,
  paymentController.payWithKey
);
//to delete
router.post(
  "/make/card/payment",
  userValidator.validateUserForPayment,
  paymentValidator.validateCardPayment,
  paymentController.payWithCard
);
//to delete
router.post(
  "/freetrial",
  userValidator.validateUserForPayment,
  paymentController.freeTrialPayment
);
router.post(
  "/with/freetrial",
  checkForExistingTransactions,
  activateWithFreeTrial
);
router.post(
  "/with/key",
  checkForExistingTransactions,
  verifyLisenseKey,
  payWithKeyOrCard
);
router.post(
  "/with/card",
  checkForExistingTransactions,
  verifyCardTransaction,
  payWithKeyOrCard
);
module.exports = router;
