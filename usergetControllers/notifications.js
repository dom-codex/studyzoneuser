const notificationDb = require("../models/notifications");
const axios = require("axios")
exports.getNotifications = async (req, res, next) => {
  try {
    const { user, canProceed } = req;
    const { page } = req.query;
    if (!canProceed) {
      return res.json({
        code: 400,
        message: "cannot process request",
      });
    }
    //get notifications
    const limit = 10;
    const notifications = await notificationDb.findAll({
      limit: limit,
      offset: limit * page,
      where: {
        userId: user.id,
      },
      attributes: [
        "notificationId",
        "message",
        "createdAt",
        "isOpened",
        "subject",
      ],
    });
    return res.status(200).json({
      code: 200,
      notifications,
    });
  } catch (e) {
    console.log(e);
  }
};
exports.getAnnouncements = async(req,res,next)=>{
  try{
    const {page} = req.query
    const uri = `${process.env.centralBase}/notification/get/announcements?page=${page}`
    const {data} = await axios.get(uri)
    return res.status(200).json({
      code:200,
      announcements:data.announcements
    })
  }catch(e){
    console.log(e)
    res.status(500).json({
      code:500,
      message:"an error occurred"
    })
  }
}