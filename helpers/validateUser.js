const userDb = require("../models/user");
module.exports = async (req, res, next) => {
  const { email,deviceId } = req.body;
  //1. find user
  const user = await userDb.findOne({
    where: {
      email: email,
    },
    attributes: ["id", "email","deviceId"],
  });
  if (!user) {
    return res.status(400).json({
      code: 404,
      message: "invalid email",
    });
  }
  if(user.deviceId != deviceId){
    return res.status(404).json({
      code:404,
      message:"cannot reset password from this device"
    })
  }
  req.canProceed = true;
  req.user = user;
  next();
};
