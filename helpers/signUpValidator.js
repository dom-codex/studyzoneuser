const userDb = require("../models/user");
module.exports = async (req, res, next) => {
  //validate all inputs
  console.log(req.body);
  const { email, deviceId } = req.body;
  //1. check if email is all ready taken
  const user = await userDb.findOne({
    where: {
      email: email,
    },
    attributes: {
      email,
    },
  });
  if (user != null) {
    //send response to user telling them the email already exists
    return res.status(401).json({
      code: 401,
      message: "Email is already associated with an account",
    });
  }
  //2 check if device has been used to sign up before
  const isDevice = await userDb.findOne({
    where: {
      deviceId: deviceId,
    },
    attributes: {
      deviceId,
    },
  });
  if (isDevice != null) {
    //tell user they cant signup using the same device
    return res.status(401).json({
      code: 401,
      message: "an account is associated with this device",
    });
  }
  //3 . check if email is email
  //4. check if number and names meet allowable limits
  //if all condition for sign up is satisfied
  req.canCreate = true;
  next();
};
