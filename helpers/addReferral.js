const { Op } = require("sequelize");
const referral = require("../models/referral");
const referralIdRecord = require("../models/referralList");
const userDb = require("../models/user");
const nanoid = require("nanoid").nanoid;
module.exports = async (referralCode, newUser) => {
  //check if referral exists
  const referrer = await userDb.findOne({
    where: {
      referral: referralCode,
    },
    attributes: ["email", "id"],
  });
  if (referrer == null) {
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
  //get user record from referral main listen
  const referrerRecord = await referral.findOne({
    where: {
      userId: referrer.id,
    },
  });
  //if no record is established for the user create one and do necessary increments
  //if record already exist do necessary updates
  if (!referrerRecord) {
    const ref = await referral.create({
      userId: referrer.id,
      totalEarned: 20,
      noOfReferrals: 1,
    });
  } else {
    referrerRecord.totalEarned = referrerRecord.totalEarned + 20;
    referrerRecord.noOfReferrals = referrerRecord.noOfReferrals + 1;
    await referrerRecord.save();
  }
  await referralIdRecord.create({
    referrer: referrer.id,
    referred: newUser.id,
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
