const transactionDb = require("../models/transaction");
const { Op } = require("sequelize");
const axios = require("axios")
exports.getTransactions = async (req, res, next) => {
  try {
    const { canProceed, user } = req;
    const { page } = req.query;

    const limit = 1;
    const transactions = await transactionDb.findAll({
      limit: limit,
      offset: limit * page,
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
