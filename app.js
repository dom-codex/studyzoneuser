const http = require("http");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
//database imports
const user = require("./models/user");
const referral = require("./models/referral");
const pwReset = require("./models/passwordReset");
//utils function imports
const activateCors = require("./utils/cors");
const sequelize = require("./utils/database");
//routes impports
const authRoute = require("./router/authRoute");
const resetRoute = require("./router/reset");
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
app.use("/reset", resetRoute);
app.use("/verify");
//connect to database
user.hasMany(referral);
user.hasMany(pwReset);
sequelize.sync({ alter: true }).then(async (_) => {
  await mongoose.connect(process.env.mongo);
  server.listen(4000);
  console.log("listening...");
});
