const sequelize = require("../utils/database");
const Sequelize = require("sequelize");
const notification = sequelize.define("notification", {
  message: {
    type: Sequelize.STRING,
    defaultValue: "",
  },
  isOpened: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
  deliveryTime: {
    type: Sequelize.DATE,
  },
});
module.exports = notification;
