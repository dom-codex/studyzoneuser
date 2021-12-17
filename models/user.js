const sequelize = require("../utils/database");
const Sequelize = require("sequelize");
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
    type: Sequelize.STRING,
    allowNull: false,
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  bank: {
    type: Sequelize.STRING,
  },
  accountNo: {
    type: Sequelize.STRING,
  },
  accountName:{
    type:Sequelize.STRING
  },
  bankCode:{
    type:Sequelize.STRING
  },
  uid: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
  },
  deviceId: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  activationCode: {
    type: Sequelize.STRING,
    defaultValue: "0000",
  },
  referral: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: "00000",
  },
  isActivated: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
  isBlocked: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
  isLoggedIn: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
  freeTrialOn: {
    type: Sequelize.BOOLEAN,
    defaultValue: true,
  },
  freeTrialStartMillis: {
    type: Sequelize.BIGINT,
    defaultValue: 0,
  },
  freeTrialEndMillis: {
    type: Sequelize.BIGINT,
    defaultValue: 0,
  },
});
module.exports = user;
