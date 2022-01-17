const notifyDb = require("../models/notifications");
const userDb = require("../models/user");
const IO = require("../socket");
exports.getAllNotifications = async (req, res, next) => {
  const { email, uid } = req.body;
  const { page } = req.query;
  const noOfOffsets = 10;
  //1. find user
  const user = await userDb.findOne({
    where: {
      [Op.and]: [{ email: email }, { uid: uid }],
    },
    attributes: ["id", "email"],
  });
  if (!user) {
    return res.status(404).json({
      code: 404,
      message: "account does not exist",
      action: "log out",
    });
  }
  const notifications = await notifyDb.findAll({
    where: {
      userId: user.id,
    },
    ofsets: noOfOffsets * (page - 1),
    limit: 10,
  });
  res.status(200).json({
    code: 200,
    notifications: notifications,
  });
};
exports.processNotificationFromAdmin = async (req, res, next) => {
  try {
    const {  user } = req;
    const { message, subject } = req.body;
    //create new notification with user details
    const newNotification = await notifyDb.create({
      message: message,
      subject: subject,
      userId: user.id,
    });
    //send socket event to user
    //change read status if received
    //send response to user
    if (newNotification != null) {
      IO.getIO()
        .to(user.uid)
        .emit("incomingNotification", { ...newNotification.dataValues });
      return res.status(201).json({
        code: 201,
        message: "notification sent",
      });
    } else {
      return res.status(400).json({
        code: 400,
        message: "notification not sent",
      });
    }
  } catch (e) {
    console.log(e);
    res.status(500).end();
  }
};
exports.newAnnouncement = async (req, res, next) => {
  try {
    const { announcement } = req.body;
    IO.getIO().emit("announcement", announcement);
    res.status(200).json({
      code:200,
      message:"sent"
    })
  } catch (e) {
    console.log(e);
  }
};
exports.receiveRealTimeUpdate = async(req,res,next)=>{
  try{
    const {name,value} = req.body
    console.log(value)
    IO.getIO().emit(name,value)
    res.status(200).json({message:"sent"})
  }catch(e){
    console.log(e)
    res.status(500).json({
      message:"an error occurred"
    })
  }
}