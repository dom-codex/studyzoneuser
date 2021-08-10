const transactionHandler = require("../utils/payment");
exports.comfirmCardPayment = (req, res, next) => {
  try {
    //
    const {  email, uid } = req.body;
    if (!req.canProceed) {
      return res.status(404).json({
        code: 404,
        message: "invalide account details",
      });
    }
    //create transaction
    const { transaction, result } = transactionHandler.createTransaction({
      ...req.body,
      amount: req.charge,
      user: req.user,
      key: null,
    });
        const slugResult = await axois.post(process.env.downloadSlug, {
      uid: uid,
      email: email,
      deviceId: deviceId,
      sch: sch,
      fac: fal,
      dept: dept,
      lev: lev,
      ref:transaction.TxId
    });
    res.status(200).json({
      code:200,
      data:{
        slugs:slugResult,
        transaction:transaction
      }
    })
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      code: 500,
      message: "an error occurred",
    });
  }
};
