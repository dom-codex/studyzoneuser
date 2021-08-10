const express = require("express");
const router = express.Router();
const paymentHandler = require("../helpers/payment");
router.post("/keypayment", paymentHandler.validateKeyPaymentDetails);
module.exports = router;
