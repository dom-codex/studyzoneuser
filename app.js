const http = require("http");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
//database imports
const user = require("./models/user");
const referral = require("./models/referral");
const referralList = require("./models/referralList");
const pwReset = require("./models/passwordReset");
const notification = require("./models/notifications");
const db = require("./models/utils");
const transaction = require("./models/transaction");

//utils function imports
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
//initialize express
const app = express();
//create server
const server = http.createServer(app);
//init server with body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//set up cors
app.use((req, res, next) => activateCors(req, res, next));
//paths
app.use("/auth", authRoute);
app.use("/password", resetRoute);
app.use("/verify", verifyRoute);
app.use("/notifications", notificationRoute);
app.use("/upload", uploadRoute);
app.use("/find", findRoute);
app.use("/pay", paymentRoute);
//connect to database
user.hasMany(referral);
user.hasMany(pwReset);
user.hasMany(notification);
user.hasMany(referral);
user.hasMany(transaction);
sequelize.sync({ alter: true }).then(async (_) => {
  await mongoose.connect(process.env.mongo);
  //await db.create({amountToEarnOnReferral: 200,});
  server.listen(4000);
  console.log("listening...");
});
