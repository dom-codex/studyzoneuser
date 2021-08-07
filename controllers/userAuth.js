const bcyrpt = require("bcrypt");
const codeGen = require("nanoid");
//models import
const userDb = require("../models/user");
const { Op } = require("sequelize");
//helpers impor
const addReferral = require("../helpers/addReferral");
//mailer imports
const mailer = require("../utils/mailer");
exports.signUp = async (req, res, next) => {
  //retrieve input from body
  const {
    firstName,
    otherName,
    email,
    phone,
    deviceId,
    password,
    referral,
  } = req.body;
  if (!req.canCreate) {
    return res.json({
      message: "cannot create account",
    });
  }
  //hash password
  const hashedPassword = await bcyrpt.hash(password, 12);
  //generate activattion code
  const activationCode = codeGen.nanoid(5);
  const referralCode = codeGen.nanoid(6);
  //create user account
  const user = await userDb.create({
    name: firstName,
    otherName: otherName,
    email: email,
    phone: phone,
    deviceId: deviceId,
    password: hashedPassword,
    activationCode: activationCode,
    referral: referralCode,
  });
  //check if creation is successful or not
  if (user == null) {
    return res.status(402).json({
      code: 402,
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
        res.status(200).json({
          code: 200,
          message: "Account created successfully",
        })
      );
    } else {
      await user.destroy();

      res.status(402).json({
        code: 402,
        message: "An error occurred try again",
      });
    }
  } else {
    //send email with activation code
    mailer.sendActivationaCode(
      email,
      activationCode,
      res.status(200).json({
        code: 200,
        message: "Account created successfully",
      })
    );
  }
};
//login controller
exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  //find user
  const user = await userDb.findOne({
    where: {
      email: email,
    },
    attributes: ["id", "email", "isLoggedIn", "password"],
  });
  if (!user) {
    return res.status(404).json({
      code: 404,
      message: "invalid email or password",
    });
  }
  const canlogin = req.canLogin;
  if (!canlogin) {
    return res.status(404).json({
      code: 404,
      message: "invalid email or password",
    });
  }
  //check password again
  const result = await bcyrpt.compare(password, user.password);
  if (!result) {
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
  });
};
//account activation controller
exports.activateAccount = async (req, res, next) => {
  const { email, activationCode } = req.body;
  console.log(email);
  //1. check if account is already created
  let user = await userDb.findOne({
    where: {
      [Op.and]: [
        {
          email: email,
        },
        { activationCode: activationCode },
      ],
    },
    attributes: ["id", "email", "activationCode", "isActivated", "isLoggedIn"],
  });
  if (!user) {
    return res.status(404).json({
      code: 404,
      message: "invalide activation code or email",
    });
  }
  if (user.isActivated) {
    return res.status(300).json({
      code: 300,
      message: "already activated",
    });
  }
  if (user.isLoggedIn) {
    return res.status(300).json({
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
    freeTrialEndMillis: user.freeTrialEndMillis,
  });
};
