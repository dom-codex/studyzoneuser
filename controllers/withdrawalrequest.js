const axios = require("axios");
const referrerDb = require("../models/referral");
const userDb = require("../models/user");
const notificationDb = require("../models/notifications");
const IO = require("../socket");
exports.requestWithdrawal = async (req, res, next) => {
  try {
    const { user } = req;
    const { amount } = req.body;
    const requestUrl = `${process.env.centralBase}/withdrawal/request`;
    const result = await axios.post(requestUrl, {
      name: user.name,
      user: user.uid,
      email: user.email,
      amount: amount,
    });
    if (result.data.code != 200) {
      return res.json({
        code: result.data.code,
        message: result.data.message,
      });
    }
    //reduce users earned amount
    const referrerRecord = await referrerDb.findOne({
      where: {
        userId: user.id,
      },
      attribute: ["totalEarned", "id"],
    });
    referrerRecord.totalEarned = referrerRecord.totalEarned - amount;
    await referrerRecord.save();
    return res.status(200).json({
      code: 200,
      message: "request placed successfully",
    });
  } catch (e) {
    console.log(e);
    res.status(500);
  }
};
exports.reverseWithdrawal = async (req, res, next) => {
  try {
    //get details from request body
    const { userId, email, amount } = req.body;
    //validate user
    const user = await userDb.findOne({
      where: {
        email: email,
        uid: userId,
      },
      attribute: ["id", "uid"],
    });
    if (!user) {
      return res.json({
        code: 404,
        message: "user not found",
      });
    }
    //find user in referral db
    const record = await referrerDb.findOne({
      where: {
        userId: user.id,
      },
      attribute: ["totalEarned", "id"],
    });
    record.totalEarned = record.totalEarned + amount;
    await record.save();
    /*await referrerDb.update(
      {
        totalEarned: sequelize.literal(`totalEarned + ${amount}`),
      },
      {
      where:{  userId: userId},
      }
    );*/
    const notification = await notificationDb.create({
      message: `your request to withdraw #${amount} was declined, please contact support for more info`,
      subject: "Withdrawal Declined",
      userId:user.id
    });
    //send socket message
    IO.getIO().to(userId).emit("newNotification", notification);
    res.status(200).json({
      message: "reversed",
      code: 200,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      code: 500,
      message: "an error occurred",
    });
  }
};
