const sequelize = require("../utils/database");
const Sequelize = require("sequelize");
const pw = sequelize.define("passwordReset", {
  token: {
    type: Sequelize.STRING,
  },
  expires: {
    type: Sequelize.INTEGER,
  },
});
module.exports = pw;
