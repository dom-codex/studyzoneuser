const userDb = require("../../models/user");
const referralDb = require("../../models/referral");
const transactionDb = require("../../models/transaction");
const extractids = require("../../utils/extractids");
const compileResult = require("../../utils/compileUserResult");
const referral = require("../../models/referral");
const { Op } = require("sequelize");
const sequelize = require("sequelize");
module.exports = async (req, res, next) => {
  try {
    //validate calls
    const limit = 15;
    const { page } = req.query;
    /*  switch (type) {
      case "all":*/
    const userInfo = await userDb.findAll({
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
      ],
    });
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
    /*  break;
      case "activated":
        const activateduserInfo = await userDb.findAll({
          limit: limit,
          offset: limit * page,
          where: {
            isActivated: true,
            isBlocked: false,
          },
          attributes: ["name", "email", "phone", "uid", "bank", "accountNo"],
        });
        res.status(200).json({
          code: 200,
          users: activatedusers,
          message: "success",
        });
        break;
      case "blocked":
        const blockedusers = await userDb.findAll({
          where: {
            isBlocked: true,
          },
          limit: limit,
          offset: limit * page,
          attributes: ["name", "email", "phone", "uid", "bank", "accountNo"],
        });
        res.status(200).json({
          code: 200,
          users: blockedusers,
          message: "success",
        });
        break;
      case "notActivated":
        const notactivatedusers = await userDb.findAll({
          where: {
            isActivated: false,
          },
          limit: limit,
          offset: limit * page,
          attributes: ["name", "email", "phone", "uid", "bank", "accountNo"],
        });
        res.status(200).json({
          code: 200,
          users: notactivatedusers,
          message: "success",
        });
        break;
      default:
        break;
    }*/
  } catch (e) {
    console.log(e);
    res.status(500).json({
      code: 500,
      message: "an error occurred",
    });
  }
};
