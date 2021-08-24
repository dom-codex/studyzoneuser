const referralDb = require("../models/referral");
const transactionsDb = require("../models/transaction");
const sequelize = require("sequelize");
module.exports = async (req, res, next) => {
  try {
    const { user } = req;
    const referralData = await referralDb.findOne({
      where: {
        userId: user.id,
      },
      attributes: ["noOfReferrals", "totalEarned"],
    });
    const transactions = await transactionsDb.findAll({
      group: "userId",
      where: {
        userId: user.id,
      },
      attributes: [
        [sequelize.fn("COUNT", sequelize.col("userId")), "purchase"],
      ],
    });
    const referralInfo =
      referralData == null
        ? {
            noOfReferrals: 0,
            totalEarned: 0,
          }
        : referralData.dataValues;
    //couple data together
    res.status(200).json({
      code: 200,
      message: "success",
      ...user.dataValues,
      ...referralInfo,
      transactions:
        transactions.length > 0 ? transactions[0].dataValues.purchase : "0",
    });
  } catch (e) {
    console.log(e);
    res.status(500);
  }
};
