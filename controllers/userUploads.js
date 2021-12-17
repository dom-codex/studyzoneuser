const userDb = require("../models/user")
exports.setBankDetails = async (req, res, next) => {
  try{
  const user = req.user;
  const { bankName, accountNo,accountName,bankCode } = req.body;
  //find user
  const userr = await userDb.findOne({
    where:{
      id:user
    },
    attributes:["id","bank","accountNo","accountName","bankCode"]
  })
  userr.bank = bankName;
  userr.accountNo = accountNo;
  userr.accountName = accountName
  userr.bankCode = bankCode
  await userr.save();
  res.status(200).json({
    code: 200,
    message: "upload successfull",
  });
  }catch(e){
    console.log(e)
    res.status(500).json({
      message:"an error occurred"
    })
  }

};
