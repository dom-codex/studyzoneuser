const axios = require("axios");
exports.requestWithdrawal = async (req, res, next) => {
  try {
    const { user } = req;
    const { amount } = req.body;
    const requestUrl = `${process.env.centralBase}/withdrawal/request`;
    const result = await axios.post(requestUrl, {
      name: user.name,
      user: user.uid,
      email: user.email,
      amount: amount,
    });
    if (result.data.code != 200) {
      return res.json({
        code: result.data.code,
        message: result.data.message,
      });
    }
    return res.status(200).json({
      code: 200,
      message: "request placed successfully",
    });
  } catch (e) {
    console.log(e);
    res.status(500);
  }
};
