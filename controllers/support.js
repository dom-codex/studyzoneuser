const mailer = require("../utils/mailer");
const chatDb = require("../models/chat");
const axios = require("axios");
const io = require("../socket")
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
    const { message, sender, time, group } = req.body;
    const newMessage = await chatDb.build({
      message,
      sender,
      time,
      group,
    });
    //send data to admin
    const {dataValues} = newMessage
    console.log(dataValues.message)
    const uri = `${process.env.centralBase}/chat/send/message/to/admin`;
    const { data } = await axios.post(uri, {
      message: dataValues.message,
      sender: dataValues.sender,
      time: dataValues.time,
      group: dataValues.group,
      chatId: dataValues.chatId,
      name: user.name,
      email: user.email,
    });
    if (data.code != 200) {
      return res.status(data.code).json({
        code: data.code,
        message: data.message,
      });
    }
    await newMessage.save();
    console.log(dataValues)
    res.status(200).json({
      code: 200,
      message: "sent",
      chatId:dataValues.chatId
    });
  } catch (e) {
    console.log(e);
    res.status(500).end();
  }
};
exports.receiveMessageFromAdmin = async(req, res, next) => {
  try {
    const { message, time, sender, group, chatId } = req.body;
    const newChat = await chatDb.create({
      message,
      chatId,
      time,
      group,
      sender,
    });
    const IO = io.getIO()
    IO.to(group).emit("newMessage",newChat.dataValues)
    res.status(200).json({
      code: 200,
      message: "sent",
    });
  } catch (e) {
    console.log(e);
    res.status(500).end();
  }
};
