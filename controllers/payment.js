const transactionHandler = require("../utils/payment");
const axios = require("axios");
const transactionDb = require("../models/transaction");
const userDb = require("../models/user");
const { Op } = require("sequelize");
const nanoid = require("nanoid").nanoid;

/*exports.comfirmCardPayment = async (req, res, next) => {
  try {
    //
    const { email, uid, deviceId } = req.body;
    if (!req.canProceed) {
      return res.status(404).json({
        code: 404,
        message: "invalide account details",
      });
    }
    //create transaction
    const { transaction, result } = transactionHandler.createTransaction({
      ...req.body,
      amount: req.charge,
      user: req.user,
      key: null,
    });
    const slugResult = await axois.post(process.env.downloadSlug, {
      uid: uid,
      email: email,
      deviceId: deviceId,
      sch: sch,
      fac: fal,
      dept: dept,
      lev: lev,
      ref: transaction.TxId,
    });
    res.status(200).json({
      code: 200,
      data: {
        slugs: slugResult,
        transaction: transaction,
      },
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      code: 500,
      message: "an error occurred",
    });
  }
};*/
exports.activateWithFreeTrial = async (req, res, next) => {
  try {
    const { user, email } = req;
    const {
      userHash,
      amount,
      semester,
      school,
      faculty,
      department,
      level,
      title,
    } = req.body;
    const userTxId = nanoid();
    //build transaction
    const newTransaction = await transactionDb.build({
      title,
      userId: req.user,
      userEmail: email,
      userRef: userHash,
      amount,
      paymentMethod: "freetrial",
      TxId: userTxId,
      semester,
      school,
      faculty,
      department,
      level,
    });
    //create transaction on admin side
    const uri = `${process.env.centralBase}/user/new/transaction`;
    const {
      data: { created },
    } = await axios.post(uri, {
      title,
      school,
      faculty,
      department,
      level,
      semester,
      userTxId,
      paymentMethod: "freetrial",
      userEmail: email,
      userRef: userHash,
      amount,
    });
    if (!created) {
      return res.status(400).json({
        code: 401,
        created: false,
        message: "an error occurred",
      });
    }
    await newTransaction.save();
    //update user table for free freeTrialOn
    await userDb.update({
      freeTrialOn:false,
      freeTrialStartMillis:0,
    },{
      where:{
        id:user
      }
    })
    return res.status(200).json({
      created: true,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      code: 500,
      message: "an error occurred",
    });
  }
};
exports.payWithKeyOrCard = async (req, res, next) => {
  try {
    //get inputs
    const { user, email } = req;
    const {
      school,
      faculty,
      department,
      level,
      semester,
      paymentMethod,
      key,
      userHash,
      amount,
      title,
      transactionId,
    } = req.body;
    const userTxId = nanoid();
    //verify key existance and this.state
    //verify amount and key value
    //build transaction for user
    const newTransaction = await transactionDb.build({
      title,
      userId: req.user,
      userEmail: email,
      userRef: userHash,
      amount,
      paymentMethod: paymentMethod,
      TxId: userTxId,
      key,
      semester,
      school,
      faculty,
      department,
      level,
      transactionRef: transactionId,
    });
    //build transaction for admin
    const uri = `${process.env.centralBase}/user/create/new/payment/transaction`;
    const {
      data: { created },
    } = await axios.post(uri, {
      title,
      school,
      faculty,
      department,
      level,
      semester,
      paymentMethod,
      key,
      userTxId,
      userEmail: email,
      userRef: userHash,
      amount,
      transactionRef: transactionId,
    });
    if (!created) {
      return res.status(401).json({
        message: "transaction failed",
      });
    }
    console.log("saving..");
    await newTransaction.save();
    return res.status(200).json({
      created: true,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      message: "an error occurred",
    });
  }
};
//end of new method
exports.payWithKey = async (req, res, next) => {
  try {
    const { canProceed, keyResult, user } = req;
    const { key, deviceId, email, uid } = req.body;
    if (!canProceed) {
      return res.status(401).json({
        code: 401,
        message: "payment cannot be processed",
      });
    }
    //create new transaction
    const { transaction, result } = await transactionHandler.createTransaction({
      ...req.body,
      amount: keyResult.data.value,
      user: user,
    });
    if (result.data.code != 200) {
      return res.status(400).json({
        code: 400,
        message: "an error occured try again or contact support",
      });
    }
    //update key status
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
    await transaction.save();
    res.status(200).json({
      code: 200,
      message: "success",
      //transaction,
      hasPaid: true,
    });
  } catch (e) {
    console.log(e);
    res.status(500).end();
  }
};
exports.payWithCard = async (req, res, next) => {
  try {
    const { deviceId, email, uid } = req.body;
    const { canProceed, user, amount } = req;
    if (!canProceed) {
      return res.json({
        code: 401,
        message: "payment cannot be processed",
      });
    }
    const { transaction, result } = await transactionHandler.createTransaction({
      ...req.body,
      amount: amount,
      user: user,
    });
    if (result.data.code != 200) {
      return res.status(400).json({
        code: 400,
        message: "an error occured try again or contact support",
      });
    }
    await transaction.save();
    res.status(200).json({
      code: 200,
      message: "success",
      //  transaction,
      hasPaid: true,
    });
  } catch (e) {
    console.log(e);
    res.status(500).end();
  }
};
exports.freeTrialPayment = async (req, res, next) => {
  try {
    const { sch, faculty, department, level, semester, pricing, email } =
      req.body;
    const { user } = req;
    //check if free trial download is still possible
    const freetrialstatusUri = `${process.env.centralBase}/get/freetrial/status`;
    //verify freetrial this.state.
    const freeTrialResult = await axios.get(freetrialstatusUri);
    if (freeTrialResult.data.value != "true") {
      return res.status(400).json({
        code: 400,
        message: "free trial no longer available",
      });
    }
    const date = Date.now();
    if (date >= user.freeTrialEndMillis || user.freeTrialStartMillis <= 0) {
      return res.status(400).json({
        code: 400,
        message: "free trial already expired",
      });
    }
    const transactions = await transactionDb.findOne({
      [Op.and]: [
        {
          userId: user.id,
        },
        {
          school: sch,
        },
        { faculty: faculty },
        { department: department },
        { level: level },
        { semester: semester },
        { paymentMethod: "freetrial" },
      ],
    });
    if (transactions) {
      return res.status(403).json({
        code: 403,
        message: "already used freetrial",
      });
    }
    //create new transaction
    const { transaction, result } = await transactionHandler.createTransaction({
      ...req.body,
      uid: user.uid,
      sch: sch,
      fal: faculty,
      dept: department,
      lev: level,
      sem: semester,
      email: email,
      amount: pricing,
      user: user,
    });
    if (result.data.code != 200) {
      return res.status(400).json({
        code: 400,
        message: "an error occured try again or contact support",
      });
    }
    user.freeTrialOn = false;
    user.freeTrialStartMillis = 0;
    user.freeTrialEndMillis = 0;
    await user.save();
    await transaction.save();
    res.status(200).json({
      code: 200,
      message: "success",
      hasPaid: true,
    });
  } catch (e) {
    console.log(e);
    res.status(500);
  }
};
