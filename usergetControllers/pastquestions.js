const axios = require("axios");
const transactionDb = require("../models/transaction");
const userDb = require("../models/user");
exports.getPastquestionsOnly = async (req, res, next) => {
  try {
    const { user } = req;
    const { school, faculty, department, level, semester, page } = req.query;
    //send network request to admin database for pastquestion
    const uri = `${process.env.centralBase}/user/get/pastquestions/only?school=${school}&faculty=${faculty}&department=${department}&level=${level}&semester=${semester}&page=${page}`;
    const result = await axios(uri);
    res.status(200).json({
      pastquestions: result.data.pastquestions,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      message: "an error occurred,try again",
    });
  }
};
exports.getPaymentStatus = async (req, res, next) => {
  try {
    const { user } = req;
    const { school, faculty, department, level, semester } = req.query;
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
      return res.status(200).json({
        hasPaid: false,
        message: "not paid",
      });
    }
    return res.status(200).json({
      hasPaid: true,
      message: "paid",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      message: "an error occurred",
    });
  }
};
exports.checkFreeTrialOption = async (req, res, next) => {
  try {
    //check user db if free trial option is still available
    const {user} = req
    const userr = await userDb.findOne({
      where:{
        id:user
      },
      attributes:["freeTrialOn","freeTrialEndMillis","freeTrialStartMillis"]
    })
    if(!userr.dataValues.freeTrialOn){
      return res.status(200).json({
        freeTrialAvailable:false
      })
    }
    else if(!(userr.dataValues.freeTrialStartMillis>0 && userr.dataValues.freeTrialEndMillis > Date.now())){
      return res.status(200).json({
        freeTrialAvailable:false
      })
    }
    const uri = `${process.env.centralBase}/user/get/freetrial/settings`;
    const {
      data: { freeTrialAvailable },
    } = await axios(uri);
    return res.status(200).json({
      freeTrialAvailable,
    });
  } catch (e) {
    console.log(e);
  }
};
exports.getPastQuestionsPrice = async (req, res, next) => {
  try {
    const { school, faculty, department, level, semester } = req.query;
    const uri = `${process.env.centralBase}/user/get/pastquestions/price?school=${school}&faculty=${faculty}&department=${department}&level=${level}&semester=${semester}`;
    const {
      data: { price },
    } = await axios(uri);
    res.status(200).json({
      price,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      message: "an error occurred",
      code: 500,
    });
  }
};
