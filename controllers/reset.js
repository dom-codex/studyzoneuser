const nanoid = require("nanoid").nanoid;
const userDb = require("../models/user");
const pw = require("../models/passwordReset");
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");
const mailer  = require("../utils/mailer")
exports.setNewDeviceId = async(req,res,next)=>{
  try{
    const {deviceId,token,email,newPassword} = req.body
    const user = await userDb.findOne({
      where:{
      email:email
      },
      attribute:["id","password","email","isBlocked","deviceId","isActivated"]
    })
    if(!user){
      return res.status(404).json({
        code:404,
        message:"user not found"
      })
    }
    if(!user.isActivated){
      return res.status(404).json({
        message:"cannot complete operation",
        code:401
      })
    }  
     if(user.isBlocked){
      return res.status(401).json({
        code:401,
        message:"operation cannot be completed"
      })
    }
    //const check pass password
    const result = await bcrypt.compare(newPassword,user.password)
    if(!result){
      return res.status(400).json({
        code:400,
        message:"invalid emaill or password"
      })
    }
 
    const pwResetRecord = await pw.findOne({
      where: {
        [Op.and]: [
          {
            userId: user.id,
          },
          {
            token: token,
          },
        ],
      },
    });
    if (!pwResetRecord) {
      return res.status(404).json({
        code: 404,
        message: "failed to reset password",
      });
    }
    if (pwResetRecord.expires < Date.now()) {
      await pw.destroy({ where: { userId: user.id } });
      return res.status(400).json({
        code: 400,
        message: "token expired",
      });
    }
    user.deviceId = deviceId
    await user.save()
    await pwResetRecord.destroy({where:{
      userId:user.id
    }})
    return res.status(200).json({
      code:200,
      message:"new device assigned"
    })
  }catch(e){
    console.log(e)
    res.status(500).json({
      code:500,
      message:"an error occurred"
    })
  }
}
exports.resetDeviceId = async(req,res,next)=>{
  try{
    const {email,password,deviceId} = req.body
    const alreadyUsed = await userDb.findOne({
      where:{
       deviceId:deviceId 
      },
      attributes:["id"]
    })
    if(alreadyUsed !=null){
      return res.status(410).json({
        message:"device already in use",
        code:410
      })
    }
    const user = await userDb.findOne({
      where:{
      email:email
      },
      attribute:["password","email","isBlocked"]
    })
    if(!user){
      return res.status(404).json({
        code:404,
        message:"user not found"
      })
    }
    //const check pass password
    const result = await bcrypt.compare(password,user.password)
    if(!result){
      return res.status(400).json({
        code:400,
        message:"invalid emaill or password"
      })
    }
    if(user.isBlocked){
      return res.status(401).json({
        code:401,
        message:"operation cannot be completed"
      })
    }
    const token = nanoid(6)
    //create a reset entry
    const time = 10 * 60 * 1000;
    const pr = await pw.create({
      token: token,
      expires: Date.now() + time,
      userId: user.id,
    });
    mailer.sendResetToken(email,token,pr,res)
  }catch(e){
    console.log(e)
    res.status(500).json({
      code:500,
      message:"an error occurred"
    })
  }
}
exports.resetPassword = async (req, res, next) => {
  const canReset = req.canProceed;
  const user = req.user;
  const {email} = req.body
  if (!canReset) {
    return res.status(404).json({
      code: 404,
      message: "invalid email",
    });
  }
  const resetToken = nanoid(6);
  //create a reset entry
  const time = 10 * 60 * 1000;
  const pr = await pw.build({
    token: resetToken,
    expires: Date.now() + time,
    userId: user.id,
  });
  //send email
  mailer.sendResetToken(email,resetToken,pr,res)

};
exports.changePassword = async (req, res, next) => {
  const { token, email, newPassword } = req.body;
  const canReset = req.canProceed;
  const user = await userDb.findOne({
    where: {
      email: email,
    },
    attribute: ["id", "email", "password"],
  });
  if (!canReset && user) {
    return res.status(404).json({
      code: 404,
      message: "invalid email",
    });
  }
  const pwResetRecord = await pw.findOne({
    where: {
      [Op.and]: [
        {
          userId: user.id,
        },
        {
          token: token,
        },
      ],
    },
  });
  if (!pwResetRecord) {
    return res.status(404).json({
      code: 404,
      message: "failed to reset password",
    });
  }
  if (pwResetRecord.expires < Date.now()) {
    await pw.destroy({ where: { userId: user.id } });
    return res.status(400).json({
      code: 400,
      message: "token expired",
    });
  }
  if (!user.isActivated) {
    return res.status(403).json({
      code: 403,
      message: "failed, account not activated",
    });
  }
  const newHashPassword = await bcrypt.hash(newPassword, 12);
  user.password = newHashPassword;
  await user.save();
  res.status(200).json({
    code: 200,
    message: "password changed sucessfully",
  });
};
exports.updatePassword = async (req, res, next) => {
  try {
    const { newPassword, oldPassword } = req.body;
    const { aUser, canProceed } = req;
    if (!canProceed) {
      return res.status(400).json({
        code: 400,
        message: "cannot process request",
      });
    }
    //verify oldPassword
    const result = await bcrypt.compare(oldPassword, aUser.password);
    if (!result) {
      return res.status(400).json({
        code: 400,
        message: "incorrect old password",
      });
    }
    //hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    aUser.password = hashedPassword;
    await aUser.save();
    return res.status(200).json({
      message: "success",
      code: 200,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      message:"an error occurred"
    });
  }
};
