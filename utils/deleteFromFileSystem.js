const fs = require("fs");
const path = require("path");
module.exports = (fileName) => {
  fs.unlink(path.join("./" + "uploads/" + fileName), (e) => console.log(e));
};
