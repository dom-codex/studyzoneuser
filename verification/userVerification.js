const userDb = require("../models/user");
//helper functions
const verifyUserAndDevice = async (userHash, deviceId) => {
  try {
    //find user
    const user = await userDb.findOne({
      where: {
        uid: userHash,
      },
      attribute: ["id", "deviceId", "email","isBlocked","isActivated"],
    });
    if (!user) {
      return {
        verified: false,
        code: 404,
        message: "user not found",
      };
    }
    if(user.isBlocked)return {
      verified:false,
      code:410,
      message:"account has been suspended,kindly contact support for help"
    }
    if(!user.isActivated)return{
      verified:false,
      code:410,
      message:"account has not been activated"
    }
    //validate device Id
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
//verification middle ware for media
exports.verifyUserOnMediaUpload = async (req, res, next) => {
  try {
    const { userHash, deviceId } = JSON.parse(req.body.data)
    console.log(userHash,deviceId)
    const verificationResult = await verifyUserAndDevice(userHash, deviceId);
    if (!verificationResult.verified) {
      return res.status(verificationResult.code).json({
        message: verificationResult.message,
      });
    }
    req.user = verificationResult.userId;
    req.email = verificationResult.email;
    req.canProceed = true
    next();
  } catch (e) {
    console.log(e);
    res.status(500).json({
      message: "an error occured try again",
    });
  }
};
//VERIFICATION MIDDLEWARE FOR REQUEST FROM ADMIN
//HELPER FUNCTION
const validateUser = async(userId)=>{
  //FIND USER
  const user = await userDb.findOne({
    where:{
      uid:userId
    },
    attributes:["id","email","uid"]
  })
  if(!user){
    return {
      validated:false
    }
  }
  return {
    validated:true,
    userr:user
  }
}
exports.verifyUserForAdminPostRequest = async(req,res,next)=>{
  try{
    const {user} = req.body
    const {validated,userr} = await validateUser(user)
    if(!validated){
      return res.status(200).json({
        message:"user not found",
        code:404
      })
    }
    req.user = userr
    next()
  }catch(e){
    console.log(e)
    res.status(500).json({
      message:"an error occurred"
    })
  }
}