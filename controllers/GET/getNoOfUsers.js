const userDb = require("../../models/user");
const sequelize = require("sequelize");
module.exports = async (req, res, next) => {
  const noOfUsers = await userDb.findAll({
    attributes: [[sequelize.fn("COUNT", sequelize.col("uid")), "nUsers"]],
  });
  res.status(200).json({
    code: 200,
    nUsers: noOfUsers[0].dataValues.nUsers,
  });
};
