const sequelize = require("../utils/database");
const Sequelize = require("sequelize");
module.exports = sequelize.define("download", {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  fileName: {
    type: Sequelize.STRING,
  },
  cloudUri:{
    type:Sequelize.STRING
  },
  slug: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  pastQuestion: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  downloaded: {
    type: Sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
});
