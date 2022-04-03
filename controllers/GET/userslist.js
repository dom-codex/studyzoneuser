const userDb = require("../../models/user");
const referralDb = require("../../models/referral");
const transactionDb = require("../../models/transaction");
const extractids = require("../../utils/extractids");
const compileResult = require("../../utils/compileUserResult");
const referral = require("../../models/referral");
const { Op } = require("sequelize");
const sequelize = require("sequelize");
const { limit } = require("../../utils/constants");

module.exports = async (req, res, next) => {
  try {
    //validate calls
    const { page } = req.query;
    /*  switch (type) {
      case "all":*/
    const userInfo = await fetchusersInCategory(req) /* await userDb.findAll({
      limit: limit,
      offset: limit * page,
      attributes: [
        "id",
        "name",
        "email",
        "phone",
        "uid",
        "bank",
        "accountNo",
        "isActivated",
        "isLoggedIn",
        "isBlocked",
      ],
    });*/
    //extract ids
    const userIds = extractids(userInfo);
    //retrieve referralInfo
    const referralInfo = await referralDb.findAll({
      where: {
        userId: {
          [Op.in]: userIds,
        },
      },
      attributes: ["noOfReferrals", "totalEarned", "userId"],
    });
    const transactionInfo = await transactionDb.findAll({
      where: {
        userId: {
          [Op.in]: userIds,
        },
      },
      group: "userId",
      attributes: [
        "userId",
        [sequelize.fn("COUNT", sequelize.col("userId")), "transactions"],
      ],
    });
    const compiled = compileResult(
      userInfo,
      userIds,
      referralInfo,
      transactionInfo
    );
    return res.status(200).json({
      compiled: compiled,
      code: 200,
      message: "success",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      code: 500,
      message: "an error occurred",
    });
  }
};
const getCondition = (category)=>{
  if(category=="ACTIVATED"){
    return {
      isActivated:true,
      isBlocked:false
    }
  }else if(category == "NOT_ACTIVATED"){
    return {
      isActivated:false,
      isBlocked:false
    }
  }  else if (category == "BLOCKED") {
      return {
        isBlocked:true
      }
    }
      else{
        return {}
      }
}
const fetchusersInCategory = (req)=>{
  //validate calls
  const { page,category } = req.query;
  const where = getCondition(category)
  
  return  userDb.findAll({
    limit: limit,
    where:where,
    offset: limit * (page - 1),
    attributes: [
      "id",
      "name",
      "email",
      "phone",
      "uid",
      "bank",
      "accountNo",
      "isActivated",
      "isLoggedIn",
      "isBlocked",
    ],
  });
}
