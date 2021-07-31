const Sequelize = require("sequelize");
const sequelize = require("../utils/database");
const user = sequelize.define("user", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    //set maxlength later
  },
  phone: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  deviceId: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  activationCode: {
    type: Sequelize.STRING,
    defaultValue: "0000",
  },
  isActivated: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
  isLoggedIn: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
});
