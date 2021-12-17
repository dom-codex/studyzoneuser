const refferalList = require("../models/referralList");
const userdb = require("../models/user");
const extractReffered = require("../utils/extractReferralsId");
const referrersDb = require("../models/referral");
const sequelize = require("sequelize");
module.exports = async (req, res, next) => {
  try {
    const { user } = req;
    const { page } = req.query;
    const limit = 10;
    const referrerInfo = await referrersDb.findOne({
      where: {
        userId: user,
      },
      attributes: ["noOfReferrals", "totalEarned"],
    });
    const referrallist = await refferalList.findAll({
      limit: limit,
      offset: page * limit,
      where: {
        referrer: user,
      },
      attributes: ["referred"],
    });
    //extract refferred ids
    const referredIds = extractReffered(referrallist);
    //find associated users
    const users = await userdb.findAll({
      where: {
        id: {
          [sequelize.Op.in]: referredIds,
        },
      },
      attributes: ["name", "phone", "createdAt"],
    });
    if (!referrerInfo) {
      return res.json({
        code: 300,
        message: "no referrals yet",
        referrals: [],
        referrerInfo: null,
      });
    }
    res.status(200).json({
      code: 200,
      message: "success",
      referrals: users,
      referrerInfo,
    });
  } catch (e) {
    console.log(e);
    res.status(500);
  }
};
