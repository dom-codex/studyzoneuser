const userDb = require("../models/user");
const { Op } = require("sequelize");
module.exports = async (req, res, next) => {
  const { email, uid } = req.body;
  //1. find user account
  const user = await userDb.findOne({
    where: {
      [Op.and]: [
        {
          email: email,
        },
        {
          uid: uid,
        },
      ],
    },
    attributes: ["id", "email", "bank", "accountNo"],
  });
  if (!user) {
    res.status(404).json({
      code: 404,
      message: "user not found",
    });
  }
  //validate accontNo and bank strings
  req.canUpload = true;
  req.user = user;
  next();
};
