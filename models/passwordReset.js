const sequelize = require("../utils/database");
const Sequelize = require("sequelize");
const pw = sequelize.define("passwordReset", {
  token: {
    type: Sequelize.STRING,
  },
  expires: {
    type: Sequelize.BIGINT,
  },
});
module.exports = pw;
