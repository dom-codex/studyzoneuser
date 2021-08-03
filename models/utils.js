const mongoose = require("mongoose");
const schema = mongoose.Schema;
const util = new schema({
  amountToEarnOnReferral: schema.Types.Number,
});
const utilModel = mongoose.model("util", util);
module.exports = utilModel;
