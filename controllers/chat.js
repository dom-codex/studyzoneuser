const axios = require("axios");
const chatDb = require("../models/chat");
const { getIO } = require("../socket");
const path = require("path");
const fs = require("fs");
const cloudinary = require("cloudinary");
const multer = require("multer");
const nanoid = require("nanoid").nanoid
const sequelize = require("sequelize")
exports.getGroupChatDetails = async (req, res, next) => {
  try {
    const { canProceed } = req;
    if (!canProceed) {
      return res.status(404).json({
        code: 404,
        message: "user not found",
      });
    }
    const { user, department } = req.query;
    const uri = `${process.env.centralBase}/chat/get/group/details?user=${user}&department=${department}`;
    const { data } = await axios.get(uri);
    return res.status(data.code).json({
      code: data.code,
      school: data.school,
      department: data.department,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      code:500,
    });
  }
};
const deleteFile = (fileName, cb) => {
  fs.unlink(`./uploads/${fileName}`, (e) => {
    cb();
  });
};
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    const name = `study_img_${nanoid()}_${file.originalname}`;
    req.fileName = name;
    cb(null, name);
  },
  //add mime type and size filter
});
exports.imageUploader = multer({ storage: storage }).single("chatImage");
exports.sendChatMedia = async(req,res,next)=>{
  try{
    const {canProceed,fileName} = req
    const pathTofile = path.join(`./uploads/${fileName}`);
    if(!canProceed){
      return deleteFile(pathTofile,()=>{
        return res.status(401).json({
          code:"401",
          message:"failed to send"
        })
      })

    }
    const result = await cloudinary.v2.uploader.upload(pathTofile);
    const { message, time, user, department, name } = JSON.parse(req.body.data);
    const newChat = await chatDb.create({
      message,
      time,
      sender: user,
      messageType:"SENDER_WITH_MEDIA",
      mediaUrl:result.secure_url,
      mediaName:result.public_id,
      group:department
    });
    getIO().to(department).emit("incomingMessage", {
      name: name,
      message: newChat.message,
      sender: user,
      time: time,
      chatId: newChat.chatId,
      messageType:"RECEIVER_WITH_MEDIA",
      mediaUrl:result.secure_url,
      mediaName:result.public_id
    });
    deleteFile(pathTofile,()=>{
      res.status(201).json({
        code: 201,
        message: "message sent successfully",
        chatId:newChat.chatId
      });
    })

  }catch(e){
    console.log(e)
    const {fileName} = req
    const pathTofile = path.join(`./uploads/${fileName}`);
    deleteFile(pathTofile,()=>{
      res.status(500).json({
        code:500,
        message:"an error occurred"
      })
    })

  }
}
exports.sendChatMessage = async(req, res, next) => {
  try {
    const { canProceed } = req;
    if (!canProceed) {
      return res.status(404).json({
        code: 404,
        message: "user not found",
      });
    }
    const { message, time, user, department, name } = req.body;
    const newChat = await chatDb.create({
      message,
      time,
      sender: user,
      messageType:"SENDER",
      group:department
    });
    //send socket to interested parties
    getIO().to(department).emit("incomingMessage", {
      name: name,
      message: newChat.message,
      messageType:"RECEIVER",
      sender: user,
      time: time,
      chatId: newChat.chatId,
    });
    res.status(201).json({
      code: 201,
      message: "message sent successfully",
      chatId:newChat.chatId
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      code:500,
      message:"an error occured"
    });
  }
};
exports.getGroupOfflineMessages = async(req,res,next)=>{
  try{
    const {canProceed} = req
    if(!canProceed){
      return res.status(401).json({
        code:401,
        message:"failed"
      })
    }
    const {use,group,chatIds} = req.body
    const chats = await chatDb.findAll({
  where:{
    sender:{
      [sequelize.Op.not]:user
    },
    group:group,
    chatId:{
      [sequelize.Op.notIn]:chatIds

    },
  },
  attributes:{exclude:["id","createdAt","updatedAt"]}
})
  }catch(e){
    console.log(e)
    res.status(500).json({
      code:500,
      message:"an error occurred"
    })
  }
}
exports.getOfflineMessages = async(req,res,next)=>{
  try{
    const {chatIds,group} = req.body
    const uri  =`${process.env.centralBase}/chat/get/offline/chats`
    const {data} = await axios.post(uri,{
      chatIds:chatIds,
      group:group
    })
    return res.status(200).json({
      code:200,
      chats:data.chats
    })
  }catch(e){
    console.log(e)
    res.status(500).end()
  }
}
