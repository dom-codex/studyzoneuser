const notificationDb = require("../models/notifications");
const axios = require("axios")
exports.getNotifications = async (req, res, next) => {
  try {
    const { user } = req;
    const { page } = req.query;
 
    //get notifications
    const limit = 10;
    const notifications = await notificationDb.findAll({
      limit: limit,
      offset: limit * page,
      where: {
        userId: user,
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
    const {data:{announcements}} = await axios.get(uri)
    return res.status(200).json({
      code:200,
      announcements:announcements?announcements:[]
    })
  }catch(e){
    console.log(e)
    res.status(500).json({
      code:500,
      message:"an error occurred"
    })
  }
}
