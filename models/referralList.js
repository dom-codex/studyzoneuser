const sequelize = require("../utils/database");
const Sequelize = require("sequelize");
const user = require("./user");
const refferalList = sequelize.define("referralList", {
  referrer: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: user,
      key: "id",
    },
  },
  referred: {
    type: Sequelize.INTEGER,
    allowNull: false,
    /*references: {
      model: user,
      key: "id",
      onDelete: "CASCADE",
    },*/
  },
});
module.exports = refferalList;
