exports.comfirmCardPayment = (req, res, next) => {
  const { trsf, email, uid } = req.body;
  if (!req.canProceed) {
    return res.status(404).json({
      code: 404,
      message: "invalide account details",
      action: "log user out",
    });
  }
};
