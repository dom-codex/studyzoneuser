const axios = require("axios");
const chatDb = require("../models/chat");
const { getIO } = require("../socket");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const nanoid = require("nanoid").nanoid
const sequelize = require("sequelize")
const {Dropbox} = require("dropbox")
const getLink = require("../utils/createOrgetLink")
const {limit} = require("../utils/constants")
exports.getGroupChatDetails = async (req, res, next) => {
  try {
    const { canProceed } = req;

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
  fs.unlink(fileName, (e) => {
    cb();
  });
}
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
   // const result = await cloudinary.v2.uploader.upload(pathTofile);
   const uploadCallback = async(contents)=>{
    const dropbox = new Dropbox({accessToken:process.env.dropboxToken})
  const result = await dropbox.filesUpload({path:`/chatimages/${fileName}`,contents})
  const link = await getLink("chatimages",fileName)
    const { message, time, user, department, name,timeSent } = JSON.parse(req.body.data);
    const msgTime = Date.now() 
    const newChat = await chatDb.create({
       message,
       time,
       sender: user,
       messageType:"SENDER_WITH_MEDIA",
       mediaUrl:link,
       mediaName:fileName,
       group:department,
       timeSent:msgTime
     });
     getIO().to(department).emit("incomingMessage", {
       name: name,
       message: newChat.message,
       sender: user,
       time: time,
       chatId: newChat.chatId,
       messageType:"RECEIVER_WITH_MEDIA",
       mediaUrl:link,
       mediaName:fileName,
       timeSent:msgTime
     });
     deleteFile(pathTofile,()=>{
       res.status(201).json({
         code: 201,
         message: "message sent successfully",
         chatId:newChat.chatId,
         msgTime:msgTime
       });
     })
   }
   fs.readFile(pathTofile,async(e,contents)=>{
     await uploadCallback(contents)
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
    const { message, time, user, department, name,timeSent } = req.body;
    const msgTime = Date.now()
    const newChat = await chatDb.create({
      message,
      time,
      sender: user,
      messageType:"SENDER",
      group:department,
      timeSent:msgTime
    });
    //send socket to interested parties
    getIO().to(department).emit("incomingMessage", {
      name: name,
      message: newChat.message,
      messageType:"RECEIVER",
      sender: user,
      time: time,
      chatId: newChat.chatId,
      timeSent:msgTime
    });
    res.status(201).json({
      code: 201,
      message: "message sent successfully",
      chatId:newChat.chatId,
      msgTime:msgTime
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
  
    const {group,userHash,firstLoad,timeSent} = req.body
    let chats =firstLoad? await chatDb.findAll({ 
     // order:[["timeSent","DESC"]],

  where:{
    sender:{
      [sequelize.Op.not]:userHash
    },
    group:group,
    timeSent:{
      [sequelize.Op.gt]:timeSent
    }
    /*chatId:{
      [sequelize.Op.notIn]:chatIds

    },*/
  },
  attributes:{exclude:["id","createdAt","updatedAt"]}
}): await chatDb.findAll({
  limit:limit,
  //order:[["timeSent","DESC"]],
  where:{
    sender:{
      [sequelize.Op.not]:userHash
    },
    group:group,
    timeSent:{
      [sequelize.Op.lt]:timeSent
    },
  } ,
     attributes:{exclude:["id","createdAt","updatedAt"]} 

})

res.status(200).json({
  chats:chats,
  code:200,
  message:"success"
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
    const {group,timeSent,firstLoad} = req.body
   /* const uri  =`${process.env.centralBase}/chat/get/offline/chats`
    const {data} = await axios.post(uri,{
      //chatIds:chatIds,
      group:group,
      timeSent:timeSent,
      firstLoad:firstLoad
    })*/
    const chats = await chatDb.findAll({
      order:[["id","DESC"]],  
      where: {
        group: group,
        timeSent:{
          [sequelize.Op.gt]:parseInt(timeSent)
        }
      },
      //offset: limit * page,
    })
    return res.status(200).json({
      code:200,
      chats:chats
    })
  }catch(e){
    console.log(e)
    res.status(500).end()
  }
}
