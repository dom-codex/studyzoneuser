const userDb = require("../models/user");
const { Op } = require("sequelize");
exports.findAUser = async (req, res, next) => {
  const { email, uid, deviceId } = req.body;
  try {
    const user = await userDb.findOne({
      where: {
        [Op.and]: [{ email: email }, { uid: uid }, { deviceId: deviceId }],
      },
    });
    if (!user) {
      return res.status(404).json({
        code: 404,
        message: "user does not exist",
        isValid: false,
      });
    }
    return res.status(200).json({
      code: 200,
      message: "user found",
      isValid: true,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      code: 500,
      message: "an error occured",
    });
  }
};
exports.validateUser = async (req, res, next) => {
  try {
    const { user } = req.query;
    const aUser = await userDb.findOne({
      where: {
        uid: user,
      },
      attributes: [
        "name",
        "id",
        "email",
        "phone",
        "referral",
        "freeTrialOn",
        "uid",
      ],
    });
    if (!user) {
      return res.json({
        code: 404,
        message: "account not found",
      });
    }
    req.user = aUser;
    req.canProceed = true;
    next();
  } catch (e) {
    console.log(e);
    res.status(500).end();
  }
};
exports.validateUserForPasswordUpdate = async (req, res, next) => {
  try {
    const { user } = req.body;
    const aUser = await userDb.findOne({
      where: {
        uid: user,
      },
      attributes: ["id", "password"],
    });
    if (!aUser) {
      return res.status(404).json({
        code: 404,
        message: "user not found",
      });
    }
    req.user = aUser;
    req.canProceed = true;
    next();
  } catch (e) {
    console.log(e);
    res.status(500).end();
  }
};
exports.validateUserOnPostRequest = async (req, res, next) => {
  try {
    const { user } = req.body;
    const auser = await userDb.findOne({
      where: {
        uid: user,
      },
      attributes: ["id", "name", "email", "uid"],
    });
    if (!auser) {
      return res.status(404).json({
        code: 404,
        message: "user does not exist",
      });
    }
    req.user = auser;
    req.canProceed = true;
    next();
  } catch (e) {
    console.log(e);
    res.status(500).end();
  }
};
exports.validateUserForPayment = async (req, res, next) => {
  try {
    const { uid, deviceId } = req.body;
    const auser = await userDb.findOne({
      where: {
        [Op.and]: [{ uid: uid }, { deviceId: deviceId }],
      },
      attributes: ["id", "name", "email", "uid","freeTrialOn","freeTrialEndMillis","freeTrialStartMillis"],
    });
    if (!auser) {
      return res.status(404).json({
        code: 404,
        message: "user does not exist",
      });
    }
    req.user = auser;
    req.canProceed = true;
    next();
  } catch (e) {
    console.log(e);
    res.status(500).end();
  }
};
exports.validateUserDeviceAndStatus= async(req,res,next)=>{
  try{
    const {deviceId,email,userId} = req.body

    const user = await userDb.findOne({
      where:{
        [Op.and]:[
          {email:email},
          {deviceId:deviceId},
          {uid:userId}
        ]
      }
    })
    if(!user){
      return res.status(404).json({
        code:404,
        message:"account does not exist"
      })
    }
    if(!user.isLoggedIn){
      return status(401).json({
        code:401,
        message:"user not logged in"
      })
    }
    res.status(200).json({
      code:200,
      message:"validated"
    })
  }catch(e){
    console.log(e)
    res.status(500).json({
      code:500,
      message:"an error occurred"
    })
  }
}
