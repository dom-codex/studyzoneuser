const userDb = require("../models/user");
const bcrypt = require("bcrypt");
module.exports = async (req, res, next) => {
  const { email, password } = req.body;
  //1. check if usr exist
  const user = await userDb.findOne({
    where: {
      email: email,
    },
    attributes: ["id", "email", "isLoggedIn", "password", "isActivated"],
  });
  if (!user) {
    return res.status(404).json({
      code: 404,
      message: "account does  not exist",
    });
  }
  //2. check if account is validated and logged in
  if (!user.isActivated) {
    return res.status(401).json({
      code: 401,
      message: "account is not activated",
    });
  }
  if (user.isLoggedIn) {
    return res.status(400).json({
      code: 400,
      message: "account is already logged in from another device",
    });
  }
  //3. validate email
  //4 compare passwords
  const result = await bcrypt.compare(password, user.password);
  if (!result) {
    return res.status(404).json({
      code: 404,
      message: "invalid email or password",
    });
  }

  req.canLogin = true;
  next();
};
