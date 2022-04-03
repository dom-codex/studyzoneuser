const transactionDb = require("../models/transaction");
const { Op } = require("sequelize");
const axios = require("axios")
const {limit} = require("../utils/constants")
exports.getTransactions = async (req, res, next) => {
  try {
    const { canProceed, user } = req;
    const { page } = req.query;
    const transactions = await transactionDb.findAll({
      limit: limit,
      offset: limit * (page-1),
      where: {
        userId: user,
      },
      attributes: ["title", "createdAt", "amount", "semester", "TxId"],
    });
    //get sum of transaction amount
    const transactionCost = await transactionDb.sum("amount", {
      where: {
        userId: user,
      },
    });
    res.status(200).json({
      code: 200,
      message: "success",
      transactions,
      cost: transactionCost,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      code: 500,
      message: "an error occurred"
    });
  }
};
exports.getCardPaymentSettings = async (req, res, next) => {
  try {
    const uri = `${process.env.centralBase}/user/get/payment/settings`
    const { data: { value } } = await axios.get(uri)
    return res.status(200).json({
      canUseCard: value == "true" ? true : false
    })
  } catch (e) {
    console.log(e)
    res.status(500).json({
      message: "an error occurred"
    })
  }
}
exports.getTransactionLatestTime = async(req,res,next)=>{
  try{
    const {department} = req.query
    const {user} = req
    const transaction = await transactionDb.findOne({
      where:{
        department:department,
        userId:user
      },
      attributes:["createdAt"]
    })
    return res.status(200).json({
      message:transaction?Date.parse(transaction.createdAt).toString():null
    })
  }catch(e){
    console.log(e);
    res.status(500).json({
      message:"an error occurred"
    })
  }
}
