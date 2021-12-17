const transactionDb = require("../models/transaction");
const { Op } = require("sequelize");
const transaction = require("../models/transaction");
exports.getTransactions = async (req, res, next) => {
  try {
    const { canProceed, user } = req;
    const { page} = req.query;
  
    const limit = 10;
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
      code:500,
      message:"an error occurred"
    });
  }
};
