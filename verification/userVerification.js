const userDb = require("../models/user");
//helper functions
const verifyUserAndDevice = async (userHash, deviceId) => {
  try {
    //find user
    const user = await userDb.findOne({
      where: {
        uid: userHash,
      },
      attribute: ["id", "deviceId"],
    });
    if (!user) {
      return {
        verified: false,
        code: 404,
        message: "user not found",
      };
    }
    //validate device Id
    if (user.deviceId !== deviceId) {
      return {
        verified: false,
        code: 404,
        message: "A device change was noticed,kindly update device",
      };
    }
    return {
      verified: true,
    };
  } catch (e) {
    res.status(500).json({
      message: "an error occured",
    });
  }
};
//verification middle ware
exports.verifyUser = async (req, res, next) => {
  try {
    const { userHash, deviceId } = req.body ? req.body : req.query;
    const verificationResult = await verifyUserAndDevice(userHash, deviceId);
    if (!verificationResult.verified) {
      return res.status(500).json({
        message: verificationResult.message,
      });
    }
    next();
  } catch (e) {
    res.status(500).json({
      message: "an error occured try again",
    });
  }
};
