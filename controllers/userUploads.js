exports.setBankDetails = async (req, res, next) => {
  const canUpload = req.canUpload;
  const user = req.user;
  const { bank, accountNo } = req.body;
  if (!canUpload) {
    return res.status(403).json({
      code: 403,
      messsage: "an error occured try again",
    });
  }
  user.bank = bank;
  user.accountNo = accountNo;
  await user.save();
  res.status(200).json({
    code: 200,
    message: "upload successfull",
  });
};
