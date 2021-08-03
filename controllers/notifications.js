const notifyDb = require("../models/notifications");
const userDb = require("../models/user");
exports.getAllNotifications = async (req, res, next) => {
  const { email, uid } = req.body;
  const { page } = req.query;
  const noOfOffsets = 10;
  //1. find user
  const user = await userDb.findOne({
    where: {
      [Op.and]: [{ email: email }, { uid: uid }],
    },
    attributes: ["id", "email"],
  });
  if (!user) {
    return res.status(404).json({
      code: 404,
      message: "account does not exist",
      action: "log out",
    });
  }
  const notifications = await notifyDb.findAll({
    where: {
      userId: user.id,
    },
    ofsets: noOfOffsets * (page - 1),
    limit: 10,
  });
  res.status(200).json({
    code: 200,
    notifications: notifications,
  });
};
