const userDb = require("../models/user");
//helper functions
const verifyUserAndDevice = async (userHash, deviceId) => {
  try {
    //find user
    console.log(userHash)
    const user = await userDb.findOne({
      where: {
        uid: userHash,
      },
      attribute: ["id", "deviceId", "email"],
    });
    if (!user) {
      return {
        verified: false,
        code: 404,
        message: "user not found",
      };
    }
    //validate device Id
    console.log(deviceId)
    if (user.deviceId !== deviceId) {
      return {
        verified: false,
        code: 410,
        message: "A device change was noticed,kindly update device",
      };
    }
    return {
      verified: true,
      userId: user.id,
      email: user.dataValues.email,
    };
  } catch (e) {
    console.log(e);
    return {
      verified: false,
      code: 404,
      message: "user not found",
    };
  }
};
//verification middle ware
exports.verifyUser = async (req, res, next) => {
  try {
    
    const { userHash, deviceId } =
      Object.keys(req.body).length > 0 ? req.body : req.query;

    const verificationResult = await verifyUserAndDevice(userHash, deviceId);
    if (!verificationResult.verified) {
      return res.status(verificationResult.code).json({
        message: verificationResult.message,
      });
    }
    req.user = verificationResult.userId;
    req.email = verificationResult.email;
    next();
  } catch (e) {
    console.log(e);
    res.status(500).json({
      message: "an error occured try again",
    });
  }
};
