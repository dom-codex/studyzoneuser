const userDb = require("../models/user");
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");
module.exports = async (req, res, next) => {
  const { email, password, deviceId } = req.body;
  //1. check if usr exist
  const user = await userDb.findOne({
    where: {
      [Op.and]: [{ email: email }, { deviceId: deviceId }],
    },
    attributes: ["id", "email", "isLoggedIn", "password", "isActivated", "isBlocked", "deviceId","phone","name","uid"],
  });
  if (!user) {
    return res.status(404).json({
      code: 404,
      message: "account does  not exist",
    });
  }
  if (user.isBlocked) {
    return res.status(401).json({
      code: 401,
      message: "account suspended contact support",

    })
  }
  //2. check if account is validated and logged in
  if (!user.isActivated) {
    return res.status(401).json({
      code: 401,
      message: "account is not activated",
      email: user.dataValues.email,
      uid: user.dataValues.uid,
      phone: user.dataValues.phone,
      name: user.dataValues.name
    });
  }

  if (deviceId != user.deviceId) {
    return res.status(400).json({
      code: 400,
      message: "account is already logged in from another device",
    });
  }
  //3. validate email
  //4 compare passwords
  const result = await bcrypt.compare(password, user.password);
  if (!result) {
    return res.status(404).json({
      code: 404,
      message: "invalid email or password",
    });
  }

  req.canLogin = true;
  next();
};
