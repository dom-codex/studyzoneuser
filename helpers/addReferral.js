const { Op } = require("sequelize");
const referral = require("../models/referral");
const userDb = require("../models/user");
const nanoid = require("nanoid").nanoid;
module.exports = async (referralCode, newUser) => {
  //check if referral exists
  const referralUser = await userDb.findOne({
    where: {
      referral: referralCode,
    },
    attributes: ["email", "id"],
  });
  if (referralUser == null) {
    return false;
  }
  //comfirm uniquness of new user code
  var codeIstaken = validateReferralCode(newUser);
  while (codeIstaken) {
    var newCode = nanoid(6);
    newUser.referral = newCode;
    newUser = await newUser.save();
    codeIstaken = await validateReferralCode(newUser);
  }
  //get amount to earn
  const ref = await referral.create({
    userId: referralUser.id,
    totalEarned: 20,
    referredId: newUser.id,
    referredEmail: newUser.email,
  });
  return true;
};
const validateReferralCode = async (newUser) => {
  return userDb.findOne({
    where: {
      [Op.and]: [
        {
          referral: newUser.referral,
        },
        { [Op.not]: { email: newUser.email } },
      ],
    },
  });
};
