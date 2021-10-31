const sequelize = require("../utils/database");
const Sequelize = require("sequelize");
module.exports = sequelize.define("chat", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  },
  message: {
    type: Sequelize.STRING(1000000),
    allowNull: false,
  },
  time: {
    type: Sequelize.STRING,
  },
  sender: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  mediaName: {
    type: Sequelize.STRING,
  },
  mediaUrl: {
    type: Sequelize.STRING,
  },
  chatId: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4(),
  },
  group: {
    type: Sequelize.STRING,
  },
  messageType: {
    type: Sequelize.STRING,
  },
});
