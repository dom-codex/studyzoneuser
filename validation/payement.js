const axios = require("axios");
const flutterWave = require("flutterwave-node-v3");
const user = require("../models/user");
const flw = new flutterWave(process.env.flw, process.env.flws);
exports.validatePaymentDetails = async (req, res, next) => {
  try {
    const { canProceed } = req;
    if (!canProceed) {
      return res.json({
        code: 404,
        message: "user not found",
      });
    }
    const { sch, fal, dept, lev, key, amountToPay, sem } = req.body;
    const validationResult = await axios.post(process.env.schUrl, {
      sid: sch,
      fid: fal,
      did: dept,
      lid: lev,
    });
    if (!validationResult.data.isValid) {
      return res.json({
        code: validationResult.data.code,
        message: validationResult.data.message,
      });
    }
    //validate key
    const keyResult = await axios.post(process.env.keyUrl, {
      sch: sch,
      faculty: fal,
      department: dept,
      level: lev,
      semester: sem,
      keys: key,
      amountToPay: amountToPay,
    });
    if (!keyResult.data.isValid) {
      return res.json({
        code: keyResult.data.code,
        message: keyResult.data.message,
      });
    }
    req.canProceed = true;
    req.keyResult = keyResult;
    next();
  } catch (e) {
    console.log(e);
    res.status(500).json({
      code:500,
      message:"an error occurred"
    })
  }
};
exports.validateCardPayment = async (req, res, next) => {
  try {
    const { user } = req;
    const { TxId } = req.body;
    //get past question price
    const uri = `${process.env.centralBase}/get/pastquestion/amount`;
    const { sch, fal, dept, lev, sem } = req.body;
    const {
      data: { price },
    } = await axios.post(uri, {
      sid: sch,
      fid: fal,
      did: dept,
      lid: lev,
      sem: sem,
    });

    const payload = { id: TxId };
    const resp = await flw.Transaction.verify(payload);
    //get status
    const status = resp.status;
    const email = resp.data.customer.email;
    const amountPaid = resp.data.amount;

    if (!(status == "success" && email == user.email)) {
      return res.status(404).json({
        code: 404,
        message: "invalid payment details",
        email,
        status,
        amountPaid,
      });
    }
    if (amountPaid.toString() != price.toString()) {
      return res.status(404).json({
        code: 400,
        message:
          "amount paid does not tally with pastquestion price,contact support",
      });
    }
    req.canProceed = true;
    req.transactionId = resp.data.id;
    req.amount = amountPaid;
    next();
  } catch (e) {
    console.log(e);
    res.status(500).json({
      code:500,
      message:"an error occurred"
    });
  }
};
