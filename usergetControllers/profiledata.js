const referralDb = require("../models/referral");
const transactionsDb = require("../models/transaction");
const sequelize = require("sequelize");
const fs = require("fs")
const userDb = require("../models/user");
const { toggleUserStatus } = require("../controllers/userAuth");
exports.getProfileData = async (req, res, next) => {
  try {
    const { user } = req;
    //find user
    const userr = await userDb.findOne({
      where:{
        id:user
      },
      attributes: [
        "name",
        "id",
        "email",
        "phone",
        "referral",
        "freeTrialOn",
        "bank",
        "accountName",
        "accountNo",
        "bankCode",
        "uid",
      ],
    })
    const referralData = await referralDb.findOne({
      where: {
        userId: user,
      },
      attributes: ["noOfReferrals", "totalEarned"],
    });
    const transactions = await transactionsDb.findAll({
      group: "userId",
      where: {
        userId: user,
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
      ...userr.dataValues,
      ...referralInfo,
      transactions:
        transactions.length > 0 ? transactions[0].dataValues.purchase : "0",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      message:"an error occurred"
    });
  }
};
exports.getBanks = (req,res,next)=>{
  try{
    //read json file
    console.log("called")
    const rawData = fs.readFileSync("banks.json")
    const banks = JSON.parse(rawData)
    res.status(200).json({
      banks:banks
    })
  }catch(e){
    console.log(e)
    res.status(500).json({
      message:"an error occurred"
    })
  }
}