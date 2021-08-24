const nanoid = require("nanoid").nanoid;
const userDb = require("../models/user");
const pw = require("../models/passwordReset");
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");
exports.resetPassword = async (req, res, next) => {
  const canReset = req.canProceed;
  const user = req.user;
  if (!canReset) {
    return res.status(404).json({
      code: 404,
      message: "invalid email",
    });
  }
  const resetToken = nanoid(6);
  //create a reset entry
  const time = 10 * 60 * 1000;
  await pw.create({
    token: resetToken,
    expires: Date.now() + time,
    userId: user.id,
  });
  //send email
  res.json({
    code: 200,
    message: "check your email for activation code",
  });
};
exports.changePassword = async (req, res, next) => {
  const { token, email, newPassword } = req.body;
  const canReset = req.canProceed;
  const user = await userDb.findOne({
    where: {
      email: email,
    },
    attribute: ["id", "email", "password"],
  });
  if (!canReset && user) {
    return res.status(404).json({
      code: 404,
      message: "invalid email",
    });
  }
  const pwResetRecord = await pw.findOne({
    where: {
      [Op.and]: [
        {
          userId: user.id,
        },
        {
          token: token,
        },
      ],
    },
  });
  if (!pwResetRecord) {
    return res.status(404).json({
      code: 404,
      message: "failed to reset password",
    });
  }
  if (pwResetRecord.expires < Date.now()) {
    await pw.destroy({ where: { userId: user.id } });
    return res.status(400).json({
      code: 400,
      message: "token expired",
    });
  }
  if (!user.isActivated) {
    return res.status(403).json({
      code: 403,
      message: "failed, account not activated",
    });
  }
  const newHashPassword = await bcrypt.hash(newPassword, 12);
  user.password = newHashPassword;
  await user.save();
  res.status(200).json({
    code: 200,
    message: "password changed sucessfully",
  });
};
exports.updatePassword = async (req, res, next) => {
  try {
    const { newPassword, oldPassword } = req.body;
    const { user, canProceed } = req;
    if (!canProceed) {
      return res.json({
        code: 400,
        message: "cannot process request",
      });
    }
    //verify oldPassword
    const result = await bcrypt.compare(oldPassword, user.password);
    if (!result) {
      return res.json({
        code: 400,
        message: "invalid password",
      });
    }
    //hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    await user.save();
    return res.status(200).json({
      message: "success",
      code: 200,
    });
  } catch (e) {
    console.log(e);
    res.status(500);
  }
};
