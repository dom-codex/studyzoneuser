const axios = require("axios");
const chatDb = require("../models/chat");
const { getIO } = require("../socket");
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
    });
    //send socket to interested parties
    getIO.to(department).emit("incomingMessage", {
      name: name,
      message: newChat.message,
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
    res.status(500).end();
  }
};
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
