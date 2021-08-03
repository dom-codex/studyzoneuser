const nanoid = require("nanoid").nanoid;
const userDb = require("../models/user");
const pw = require("../models/passwordReset");
const bcrypt = require("bcrypt");
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
  await pw.create({
    token: resetToken,
    expires: Date.now() + 5 * 60,
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
      email,
      email,
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
  const newHashPassword = await bcrypt.compare(newPassword, 12);
  user.password = newHashPassword;
  await user.save();
  await pwResetRecord.destory();
};
