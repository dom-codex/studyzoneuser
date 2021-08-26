const sequelize = require("../utils/database");
const Sequelize = require("sequelize");
const notification = sequelize.define("notification", {
  message: {
    type: Sequelize.STRING,
    defaultValue: "",
  },
  subject: {
    type: Sequelize.STRING,
  },
  isOpened: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
  notificationId: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
  },
});
module.exports = notification;
