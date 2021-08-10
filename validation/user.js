const userDb = require("../models/user");
const { Op } = require("sequelize");
exports.findAUser = async (req, res, next) => {
  const { email, uid, deviceId } = req.body;
  try {
    const user = await userDb.findOne({
      where: {
        [Op.and]: [{ email: email }, { uid: uid }, { deviceId: deviceId }],
      },
    });
    if (!user) {
      return res.status(404).json({
        code: 404,
        message: "user does not exist",
        isValid: false,
      });
    }
    return res.status(200).json({
      code: 200,
      message: "user found",
      isValid: true,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      code: 500,
      message: "an error occured",
    });
  }
};
