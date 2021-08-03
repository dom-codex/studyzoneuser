const userDb = require("../models/user");
module.exports = async (req, res, next) => {
  const { email } = req.body;
  //1. find user
  const user = await userDb.findOne({
    where: {
      email: email,
    },
    attributes: ["id", "email"],
  });
  if (!user) {
    return res.status(400).json({
      code: 404,
      message: "invalid email",
    });
  }
  req.canProceed = true;
  req.user = user;
  next();
};
