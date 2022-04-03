const notificationDb = require("../models/notifications");
const axios = require("axios")
const {limit} = require("../utils/constants")
exports.getNotifications = async (req, res, next) => {
  try {
    const { user } = req;
    const { page } = req.query;
 
    //get notifications
    const notifications = await notificationDb.findAll({
      limit: limit,
      order:[["id","DESC"]],
      offset: limit * (page-1),
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
    res.status(500).json({
      message:"an error occurred"
    })
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
