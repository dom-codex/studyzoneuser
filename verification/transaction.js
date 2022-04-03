const axios = require("axios");
const transactionDb = require("../models/transaction");
const userDb = require("../models/user");
const nanoid = require("nanoid").nanoid;
const flutterWave = require("flutterwave-node-v3");
const flw = new flutterWave(process.env.flw, process.env.flws);
exports.verifyCardTransaction = async (req, res, next) => {
  try {
    const { email } = req;
    const { transactionId, school, faculty, department, level, semester } =
      req.body;
    const payload = { id: transactionId };
    const resp = await flw.Transaction.verify(payload);
    //get status
    const status = resp.status;
    const userEmail = resp.data.customer.email;
    const amountPaid = resp.data.amount;
    //validate amount
    const uri = `${process.env.centralBase}/user/get/pastquestions/price?school=${school}&faculty=${faculty}&department=${department}&level=${level}&semester=${semester}`;
    const {
      data: { price },
    } = await axios(uri);
    if (!(status == "success" && userEmail == email)) {
      return res.status(404).json({
        code: 401,
        message: "invalid payment details",
        created: false,
      });
    } else if (price.toString() != amountPaid.toString()) {
      return res.status(404).json({
        code: 401,
        message: "invalid payment amount",
        created: false,
      });
    }
    next();
  } catch (e) {
    console.log(e);
    res.status(500).json({
      message: "an error occurred",
    });
  }
};
exports.verifyLisenseKey = async (req, res, next) => {
  try {
    const { key, amount,paymentMethod } = req.body;
    if(paymentMethod.toLowerCase() === "card"){
      return next()
    }
    const uri = `${process.env.centralBase}/validate/lisensekey`;
    const {
      data: { isUsed, message },
    } = await axios.post(uri, {
      key,
      amount,
    });
    if (isUsed) {
      return res.status(400).json({
        message:
          "key is already used or price of key is not equivalent to price of past question",
      });
    } else if (!isUsed) {
      next();
    }
  } catch (e) {
    console.log(e);
    if(e.isAxiosError){
      return res.status(400).json({
        message:e.response.data.message
      })
    }
    res.status(500).json({
      message: "an error occurred",
    });
  }
};
//methood to check for existence of payment and proceed with download
exports.verifyPayment = async (req, res, next) => {
  try {
    const { user } = req;
    //get user email
    const userr = await userDb.findOne({
      where: {
        id: user,
      },
      attributes: ["email"],
    });
    //check admin side for transaction
    const { school, faculty, department, level, semester } = req.body;
    const uri = `${process.env.centralBase}/user/get/transaction/status?school=${school}&faculty=${faculty}&department=${department}&level=${level}&semester=${semester}&userEmail=${userr.dataValues.email}`;
    const {
      data: { transactionExists },
    } = await axios(uri);
    //check user side for transaction
    const { hasPaid } = await checkUserSideForExistingTransaction(req);
    //check conditions
    if (transactionExists && hasPaid) {
      //allow download
      next();
    } else {
      res.status(401).json({
        message: "access denied",
      });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({
      message: "an error occurred",
    });
  }
};
exports.checkForExistingTransactions = async (req, res, next) => {
  try {
    const { user } = req;
    //get user email
    const userr = await userDb.findOne({
      where: {
        id: user,
      },
      attributes: ["email"],
    });
    //check admin side for transaction
    const { school, faculty, department, level, semester } = req.body;
    const uri = `${process.env.centralBase}/user/get/transaction/status?school=${school}&faculty=${faculty}&department=${department}&level=${level}&semester=${semester}&userEmail=${userr.dataValues.email}`;
    const {
      data: { transactionExists },
    } = await axios(uri);
    console.log(transactionExists)
    //check user side for transaction
    const { hasPaid } = await checkUserSideForExistingTransaction(req);
    //check conditions
    console.log(hasPaid)
    if (transactionExists && !hasPaid) {
      //create transactions on user side
      await createTransactionOnUser(req);
      return res.status(200).json({
        created: true,
      });
    } else if (transactionExists && hasPaid) {
      //return response to the client and update status
      return res.status(200).json({
        created: true,
      });
    } else {
      next();
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({
      message: "an error occurred",
    });
  }
};
//method for comfirming transaction on user side
const checkUserSideForExistingTransaction = async (req) => {
  const { user } = req;
  const { school, faculty, department, level, semester } = req.body;
  //get user email
  const userr = await userDb.findOne({
    where: {
      id: user,
    },
    attributes: ["id", "email"],
  });
  //check if user has already performed a transaction
  const transaction = await transactionDb.findOne({
    where: {
      school,
      faculty,
      department,
      level,
      semester,
      userEmail: userr.dataValues.email,
    },
    attributes: ["id"],
  });
  if (!transaction) {
    return {
      hasPaid: false,
    };
  }
  return {
    hasPaid: true,
  };
};
//method for creating transaction on user side
const createTransactionOnUser = async (req) => {
  const { user } = req;
  //get user email
  const userr = await userDb.findOne({
    where: {
      id: user,
    },
    attributes: ["email"],
  });
  const {
    userHash,
    amount,
    semester,
    school,
    faculty,
    key,
    department,
    paymentMethod,
    level,
    title,
  } = req.body;
  const userTxId = nanoid();
  //build transaction
  const newTransaction = await transactionDb.create({
    title,
    userId: req.user,
    userEmail: userr.dataValues.email,
    userRef: userHash,
    amount,
    paymentMethod: paymentMethod == null ? "freetrial" : paymentMethod,
    TxId: userTxId,
    semester,
    key,
    school,
    faculty,
    department,
    level,
  });
};
