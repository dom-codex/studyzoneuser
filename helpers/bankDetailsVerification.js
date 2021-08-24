const userDb = require("../models/user");
const { Op } = require("sequelize");
module.exports = async (req, res, next) => {
  try {
    const { uid } = req.body;
    //1. find user account
    const user = await userDb.findOne({
      where: {
        uid: uid,
      },
      attributes: ["id", "bank", "accountNo"],
    });
    if (!user) {
      res.json({
        code: 404,
        message: "user not found",
      });
    }
    //validate accontNo and bank strings
    req.canUpload = true;
    req.user = user;
    next();
  } catch (e) {
    res.json({
      code: 404,
      message: "unknown error occured",
    });
  }
};
