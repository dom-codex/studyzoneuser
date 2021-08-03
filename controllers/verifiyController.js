const userDb = require("../models/user");
exports.verifyFreeTrial = async (req, res, next) => {
  const { email } = req.body;
  //1. get user
  const user = await userDb.findOne({
    where: {
      email: email,
    },
    attributes: [
      "id",
      "email",
      "freeTrialOn",
      "freeTrialStartMillis",
      "freeTrialEndMillis",
    ],
  });
  if (!user) {
    return res.status(404).json({
      code: 404,
      message: "account does not exist",
      action: "log user out",
    });
  }
  if (!user.isActivated) {
    return res.status(402).json({
      code: 402,
      message: "account not verfied",
      action: "log out",
    });
  }
  //get start and end millis for free trial
  const startMillis = user.freeTrialStartMillis;
  const endMillis = user.freeTrialEndMillis;
  const now = Date.now();
  if (now <= endMillis) {
    return res.status(201).json({
      code: 201,
      message: "free trial still on",
      startMillis,
      endMillis,
    });
  }
  user.freeTrialOn = false;
  user.freeTrialStartMillis = 0;
  user.freeTrialEndMillis = 0;
  await user.save();
  res.status(200).json({
    code: 200,
    message: "free trial off",
    freeTrialStartMillis,
    freeTrialStartMillis,
  });
};
