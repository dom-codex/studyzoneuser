const refferalList = require("../../models/referralList");
const userDb = require("../../models/user");
const sequelize = require("sequelize");
exports.getUserReferralList = async (req, res, next) => {
  try {
    const { userId, page } = req.query;
    //find user
    const user = await userDb.findOne({
      where: {
        uid: userId,
      },
      attributes: ["id"],
    });
    if (!user) {
      return res.json({
        code: 404,
        message: "user does not exist",
      });
    }
    //retrieve referrals
    const limit = 10;
    const referredIdsList = await refferalList.findAll({
      limit: limit,
      offset: limit * page,
      where: {
        referrer: user.id,
      },
      attributes: ["referred"],
    });
    //extract ids
    const referredIds = referredIdsList.map((reffered) => reffered.referred);
    //find associated users
    const users = await userDb.findAll({
      where: {
        id: {
          [sequelize.Op.in]: referredIds,
        },
      },
      attributes: ["name", "email", "createdAt", "phone"],
    });
    return res.status(200).json({
      code: 200,
      referredPersons: users,
    });
  } catch (e) {
    console.log(e);
    res.status(500);
  }
};
