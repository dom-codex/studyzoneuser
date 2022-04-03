const mailer = require("../utils/mailer");
const chatDb = require("../models/chat");
const axios = require("axios");
const io = require("../socket");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const nanoid = require("nanoid").nanoid
const {Dropbox} = require("dropbox")
const getLink = require("../utils/createOrgetLink")
const userDb = require("../models/user")
exports.sendEmailToAdmin = async (req, res, next) => {
  try {
    const { canProceed } = req;
    if (!canProceed) {
      return res.status(404).json({
        code: 404,
        message: "user not found",
      });
    }
    const { name, email, phone, subject, description, user } = req.body;
    mailer.sendEmailToAdmin(req.body, res);
  } catch (e) {
    console.log(e);
    res.status(500).end();
  }
};
exports.sendChatToAdmin = async (req, res, next) => {
  try {
    const { canProceed, user } = req;
    if (!canProceed) {
      return res.status(404).json({
        code: 404,
        message: "user not found",
      });
    }
    //save message to db
    const { message, sender, time, group,timeSent } = req.body;
    const msgTime = Date.now()
    const newMessage = await chatDb.build({
      message,
      sender,
      time,
      group,
      messageType: "SENDER",
      timeSent:msgTime
    });
    
    //send data to admin
    const { dataValues } = newMessage;
    
    const uri = `${process.env.centralBase}/chat/send/message/to/admin`;
    const { data } = await axios.post(uri, {
      message: dataValues.message,
      sender: dataValues.sender,
      time: dataValues.time,
      group: dataValues.group,
      chatId: dataValues.chatId,
      name: user.name,
      email: user.email,
      timeSent:msgTime
    });
    if (data.code != 200) {
      return res.status(data.code).json({
        code: data.code,
        message: data.message,
      });
    }
    await newMessage.save();
    res.status(200).json({
      code: 200,
      message: "sent",
      chatId: dataValues.chatId,
      msgTime:msgTime
    });
  } catch (e) {
    console.log(e);
    res.status(500).end();
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
exports.sendMediaMessageToAdmin = async (req, res, next) => {
  try {
    const { canProceed, fileName, user } = req;
    if (!canProceed) {
      console.log("could not upload file");
      return res.status(404).json({
        code: 404,
        message: "could not upload file",
      });
    }
    //save image to cloud
    const pathTofile = path.join(`./uploads/${fileName}`);
    const uploadCallback = async(contents)=>{
      const dropbox = new Dropbox({accessToken:process.env.dropboxToken})
      await dropbox.filesUpload({path:`/support/${fileName}`,contents})
      const link = await getLink("support",fileName)
      const { message, sender, time, group,timeSent } = req.body;
      const msgTime = Date.now()
          const newMessage = await chatDb.build({
            message,
            sender,
            time,
            group,
            mediaName: fileName,
            mediaUrl: link,
            messageType: "SENDER_WITH_MEDIA",
            timeSent:msgTime
          });
          //send data to admin
          const { dataValues } = newMessage;
          
          const uri = `${process.env.centralBase}/chat/send/message/to/admin`;
          const { data } = await axios.post(uri, {
            message: dataValues.message,
            sender: dataValues.sender,
            time: dataValues.time,
            group: dataValues.group,
            chatId: dataValues.chatId,
            name: user.name,
            email: user.email,
            mediaUrl: link,
            mediaName: fileName,
            timeSent:msgTime
          });
          if (data.code != 200) {
            await dropbox.filesDeleteV2({path:`/support/${fileName}`})
            deleteFile(fileName, () => {
              return res.status(data.code).json({
                code: data.code,
                message: data.message,
              });
            });
          }
          await newMessage.save();
          deleteFile(fileName, () => {
            res.status(200).json({
              code: 200,
              message: "sent",
              chatId: dataValues.chatId,
              msgTime:msgTime
            });
          });
    }
    fs.readFile(pathTofile,async(e,contents)=>{
      if(e){
        res.status(401).json({
          message:"upload failed"
        })
      }else{
        await uploadCallback(contents)
      }
    })
//    const result = await cloudinary.v2.uploader.upload(pathTofile);
//console.log(result)
    /* const cloudStorage = new Storage({ keyFilename: "./key.json" });
    const result = await cloudStorage
      .bucket("chatImages")
      .upload(`./${pathTofile}`, { destination: fileName });
    const filelink = result[0].metadata.selfLink;
    const fileId = result[0].metadata.id;*/
    //save message to db
  } catch (e) {
    console.log(e);
    res.status(500).json({
      code: 500,
      message: "an error occurred",
    });
  }
};
exports.receiveMessageFromAdmin = async (req, res, next) => {
  try {
    const { message, time, sender, group, chatId, mediaName, mediaUrl,timeSent } =
      req.body;
    const newChat = await chatDb.create({
      message,
      chatId,
      time,
      group,
      sender,
      messageType: mediaName ? "RECEIVER_WITH_MEDIA" : "RECEIVER",
      mediaName,
      mediaUrl,
      timeSent
    });
    const IO = io.getIO();
    IO.to(group).emit("newMessage", newChat.dataValues);
    res.status(200).json({
      code: 200,
      message: "sent",
    });
  } catch (e) {
    console.log(e);
    res.status(500).end();
  }
};
exports.contactAdmin = async(req,res,next)=>{
  try{
    const {email}= req.body;
    //CHECK IF USER EXISTS ALREADY
    const user = await userDb.findOne({
      where:{
        email:email
      },
      attributes:["id"]
    })
    if(!user){
      return res.status(200).json({
        code:200,
        message:"Email is not associated to any account"
      })
    }
    //SEND MAIL TO ADMIN
    mailer.sendEmailToAdmin(req.body, res);
      }catch(e){
    res.status(500).json({
      message:"an error occurred"
    })
  }
} 