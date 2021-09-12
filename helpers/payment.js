const transactionDb = require("../models/transaction");
const userDb = require("../models/user");
const axios = require("axios");
const { Op } = require("sequelize");
const nanoid = require("nanoid").nanoid;
const transactionHandler = require("../utils/payment");
exports.validateKeyPaymentDetails = async (req, res, next) => {
  try {
    const {
      sch,
      fal,
      dept,
      lev,
      sem,
      uid,
      paymentMethod,
      key,
      amountToPay,
      title,
      email,
      deviceId,
    } = req.body;
    const user = await userDb.findOne({
      where: {
        [Op.and]: [{ email: email }, { uid: uid }],
      },
      attributes: ["id", "email"],
    });
    if (!user) {
      return res.status(404).json({
        code: 404,
        message: "account does not exist",
        action: "log out",
      });
    }
    //validate school credentials
    const validationResult = await axios.post(process.env.schUrl, {
      sid: sch,
      fid: fal,
      did: dept,
      lid: lev,
    });
    if (!validationResult.data.isValid) {
      return res.status(validationResult.data.code).json({
        code: validationResult.data.code,
        message: validationResult.data.message,
      });
    }

    //validate key
    const keyResult = await axios.post(process.env.keyUrl, {
      keys: key,
      amountToPay: amountToPay,
    });
    if (!keyResult.data.isValid) {
      return res.status(keyResult.data.code).json({
        code: keyResult.data.code,
        message: keyResult.data.message,
      });
    }
    //update key status and initiate download
    //create transaction
    // const studyTxId = nanoid();
    const { transaction, result } = await transactionHandler.createTransaction({
      ...req.body,
      amount: keyResult.data.value,
      user: user,
    });

    //call trx hook on central server
    if (result.data.code != 200) {
      await transaction.destroy();
      return res.status(400).json({
        code: 400,
        message: "an error occured try again or contact support",
      });
    }
    //update key status and initiate download
    const keyStat = await axios.post(process.env.updateKey, {
      keys: key,
      uid: uid,
      deviceId: deviceId,
      email: email,
      TrxId: transaction.TxId,
    });
    if (!keyStat.data.isValid) {
      await axios.post(process.env.deleteTransaction);
      await transaction.destroy();
      return res.status(401).json({
        code: 401,
        message: "an error occured",
      });
    }
    //create download slug
    /* const slugResult = await axios.post(process.env.createSlug, {
      uid: uid,
      email: email,
      deviceId: deviceId,
      sch: sch,
      fac: fal,
      dept: dept,
      lev: lev,
      ref: transaction.TxId,
    });*/
    if (!slugResult.data.isValid) {
      await axios.post(process.env.deleteTransaction);
      await transaction.destroy();
    }
    res.status(200).json({
      code: 200,
      message: "success",
      data: {
        slug: slugResult.data,
        transaction: transaction,
      },
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      code: 500,
      message: "an error occured",
    });
  }
};
//validation for card payment
exports.validateCardPayment = async (req, res, next) => {
  try {
    const user = await userDb.findOne({
      where: {
        [Op.and]: [{ email: email }, { uid: uid }],
      },
      attributes: ["id", "email"],
    });
    if (!user) {
      return res.status(404).json({
        code: 404,
        message: "account does not exist",
        action: "log out",
      });
    }
    //validate transaction ref on remote server
    const result = await axios.get(`payment server`);
    if (!result.ok) {
      return res.status(400).json({
        code: 400,
        message: "invalid payment details",
      });
    }
    req.user = user;
    req.charge = result.charge;
    req.canProceed = true;
    next();
  } catch (e) {
    console.log(e);
    res.status(500).json({
      code: 500,
      message: "an error occurred",
    });
  }
};
