const bcyrpt = require("bcrypt");
const codeGen = require("nanoid");
//models import
const userDb = require("../models/user");
const { Op } = require("sequelize");
//helpers impor
const addReferral = require("../helpers/addReferral");
//mailer imports
const mailer = require("../utils/mailer");
const IO = require("../socket");
exports.signUp = async (req, res, next) => {
  try {
    //retrieve input from body
    const { firstName, email, phone, deviceId, password, referral } = req.body;
    if (!req.canCreate) {
      return res.status(400).json({
        code: 400,
        message: "cannot create account",
      });
    }
    //hash password
    const hashedPassword = await bcyrpt.hash(password, 12);
    //generate activattion code
    const activationCode = codeGen.nanoid(5);
    const referralCode = codeGen.nanoid(6);
    //create user account
    const time = Date.now();
    const user = await userDb.create({
      name: firstName,
      email: email,
      phone: phone,
      deviceId: deviceId,
      password: hashedPassword,
      activationCode: activationCode,
      referral: referralCode,
      freeTrialStartMillis: time,
      freeTrialEndMillis: time + 24 * 60 * 60 * 1000,
    });
    //check if creation is successful or not
    if (user == null) {
      return res.status(400).json({
        code: 400,
        message: "An error occurred try again",
      });
    }
    //handle referral
    if (referral) {
      const result = await addReferral(referral, user);
      if (result) {
        //send email with activation code
        mailer.sendActivationaCode(
          email,
          activationCode, //send success response to user
          {
            name: user.name,
            email: user.email,
            phone: user.phone,
            uid: user.uid,
          },
          res,
          user
        );
      } else {
        await user.destroy();

        res.status(400).json({
          code: 400,
          message: "An error occurred try again",
        });
      }
    } else {
      //send email with activation code
      mailer.sendActivationaCode(
        email,
        activationCode,
        {
          name: user.name,
          email: user.email,
          phone: user.phone,
          uid: user.uid,
        },
        res,
        user
      );
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({
      code: 500,
      message: "an error occurred",
    });
  }
};
//login controller#
exports.logout = async (req, res, next) => {
  try {
    const { userHash } = req.body;
    const user = await userDb.findOne({
      where: {
        uid: userHash,
      },
      attribute: ["id", "isLoggedIn"],
    });
    if (!user) {
      return res.status(404).json({
        code: 404,
        message: "user not found",
      });
    }
    user.isLoggedIn = false;
    await user.save();
    res.status(200).json({
      code: 200,
      message: "logged out",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      code: 500,
      message: "an error occurred",
    });
  }
};
exports.login = async (req, res, next) => {
  const { email, password, deviceId } = req.body;
  const canlogin = req.canLogin;
  if (!canlogin) {
    return res.status(404).json({
      code: 404,
      message: "invalid email or password",
    });
  }
  //find user
  const user = await userDb.findOne({
    where: {
      [Op.and]: [{ email: email }, { deviceId: deviceId }],
    },
    attributes: [
      "id",
      "name",
      "email",
      "isLoggedIn",
      "uid",
      "phone",
      "isActivated",
      "isBlocked",
    ],
  });
  if (!user) {
    return res.status(404).json({
      code: 404,
      message: "invalid email or password",
    });
  }
  user.isLoggedIn = true;
  await user.save();
  res.status(200).json({
    code: 200,
    message: "logged in",
    user: user.dataValues,
  });
};
//account activation controller
exports.activateAccount = async (req, res, next) => {
  try {
    const { email, activationCode, userHash } = req.body;
    console.log(email);
    //1. check if account is already created
    let user = await userDb.findOne({
      where: {
        [Op.and]: [
          {
            email: email,
          },
          { uid: userHash },
          { activationCode: activationCode },
        ],
      },
      attributes: [
        "id",
        "email",
        "activationCode",
        "isActivated",
        "isLoggedIn",
      ],
    });
    if (!user) {
      return res.json({
        code: 404,
        message: "invalide activation code or email",
      });
    }
    if (user.isActivated) {
      return res.json({
        code: 300,
        message: "already activated",
      });
    }
    if (user.isLoggedIn) {
      return res.json({
        code: 300,
        message: "already logged in",
      });
    }
    user.freeTrialStartMillis = Date.now();
    user.freeTrialEndMillis = 86400 + user.freeTrialStartMillis;
    user.isLoggedIn = true;
    user.isActivated = true;
    user.activationCode = null;
    user = await user.save();
    res.json({
      code: 200,
      message: "account activated",
      freeTrialStart: user.freeTrialStartMillis,
      freeTrialEnd: user.freeTrialEndMillis,
    });
  } catch (e) {
    console.log(e);
    res.status(500);
  }
};
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const { user, block } = req.body;
    //find user
    const User = await userDb.findOne({
      where: {
        uid: user,
      },
      attributes: ["id", "uid"],
    });
    if (!User) {
      return res.status(404).json({
        code: 404,
        message: "user not found",
      });
    }
    //update block status
    User.isBlocked = block;
    await User.save();
    //send socketnotification to user r kick them out if received and block is true
    //send mail to user based on block status
    mailer.NotifyUserOfBlockStatus(() => {
      IO.getIO().to(user).emit("blocked");
      res.status(200).json({
        code: 200,
        message: "operation succesful",
      });
    });
    //send response
  } catch (e) {}
};
