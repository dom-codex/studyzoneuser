const http = require("http");
const express = require("express");
const bodyParser = require("body-parser");
//database imports
const user = require("./models/user");
//utils function imports
const activateCors = require("./utils/cors");
const sequelize = require("./utils/database");
//initialize express
const app = express();
//create server
const server = http.createServer(app);
//init server with body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//set up cors
app.use((_, res, next) => activateCors(req, res, next));
//connect to database
sequelize.sync().then((_) => {
  server.listen(process.env.PORT);
});
