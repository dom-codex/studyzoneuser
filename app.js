const http = require("http");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
const io = require("./socket");
//database imports
const user = require("./models/user");
const referral = require("./models/referral");
const referralList = require("./models/referralList");
const pwReset = require("./models/passwordReset");
const notification = require("./models/notifications");
const db = require("./models/utils");
const transaction = require("./models/transaction");
const downloads = require("./models/downloads");
const chats = require("./models/chat");
//utils function imports
const userVerifier = require("./verification/userVerification");
const activateCors = require("./utils/cors");
const sequelize = require("./utils/database");
//routes impports
const authRoute = require("./router/authRoute");
const resetRoute = require("./router/reset");
const verifyRoute = require("./router/verify");
const notificationRoute = require("./router/notifications");
const uploadRoute = require("./router/upload");
const findRoute = require("./router/findRoute");
const paymentRoute = require("./router/payment");
const getRoute = require("./router/getRoute");
const withdrawalRoute = require("./router/withdrawalrequest");
const downloadRoute = require("./router/download");
const chatRoute = require("./router/chat");
const supportRoute = require("./router/supportRoute");
const searchRouter = require("./router/search");
const refferalList = require("./models/referralList");
//initialize express
const app = express();
//create server
const server = http.createServer(app);
//init server with body parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
//set up cors
app.use((req, res, next) => activateCors(req, res, next));
//paths
app.use(express.static(path.join(__dirname, "downloads")));

app.use("/auth", authRoute);
app.use("/password", resetRoute);
app.use("/verify", verifyRoute);
app.use("/notifications", notificationRoute);
app.use("/upload", uploadRoute);
app.use("/find", userVerifier.verifyUser, findRoute);
app.use("/pay", userVerifier.verifyUser, paymentRoute);
app.use("/get", getRoute);
app.use("/withdrawal",withdrawalRoute);
app.use("/download", userVerifier.verifyUser, downloadRoute);
app.use("/chat", chatRoute);
app.use("/support", userVerifier.verifyUser, supportRoute);
app.use("/search", userVerifier.verifyUser, searchRouter);
//connect to database
//user.hasMany(referral, { onDelete: "CASCADE" });
user.hasMany(refferalList, { foreignKey: "referred", onDelete: "CASCADE" });
referralList.belongsTo(user);
user.hasMany(pwReset);
user.hasMany(notification);
user.hasMany(referral, { onDelete: "CASCADE" });
referral.belongsTo(user);
user.hasMany(transaction);
transaction.belongsTo(user);
user.hasMany(downloads);
downloads.belongsTo(user);
sequelize.sync({ alter: true }).then(async (_) => {
  //  await mongoose.connect(process.env.mongo);
  //await db.create({amountToEarnOnReferral: 200,});
  server.listen(4000);
  io.init(server);
  io.getIO().on("connect", (socket) => {
    console.log("socket connected");
    //activity listeners
    socket.on("joinRealTimeChannel", (data) => {
      const sentData = JSON.parse(data);
      socket.join(data.userId);
    });
    //join listener
    socket.on("joinAdminGroup", (room) => {
      //join group  chat with admin
    
      socket.join(room);
    });
    socket.on("joinGroup", (data) => {
    
      const sentData = JSON.parse(data);
      socket.join(sentData.department);
      //emit to other users that a new user has joined
      socket.broadcast.to(sentData.department).emit("newUserJoined", {
        sender: sentData.sender,
        name: sentData.name,
      });
    });
    socket.on("leavingGroup",(raw)=>{
      const data = JSON.parse(raw)
      socket.broadcast.to(data.department).emit("userLeft",{name:data.name,sender:data.user})
    })
  });
  console.log("listening...");
});
