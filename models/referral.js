const Sequelize = require("sequelize");
const sequelize = require("../utils/database");
const referral = sequelize.define("Referral", {
  referredId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  referredEmail: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  totalEarned: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
});
module.exports = referral;
