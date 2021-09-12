const transactionDb = require("../models/transaction");
const { Op } = require("sequelize");
exports.validateUserRequestState = async (req, res, next) => {
  try {
    const { user, canProceed } = req;
    const { sch, faculty, department, level, semester } = req.body;
    if (!canProceed) {
      return res.status(400).json({
        code: 400,
        message: " user not found",
      });
    }
    req.canProceed = false
      //check transaction on user db
      const userTransaction = await transactionDb.findOne({
        [Op.and]: [
          {
            userId: user.id,
          },
          {
            school: sch,
          },
          { faculty: faculty },
          { department: department },
          { level: level },
          { semester: semester },
          {
            paymentMethod: {
              [Op.or]: ["key", "card","freetrial"],
            },
          },
        ],
      });
      if (!userTransaction) {
        return res.status(404).json({
          code: 404,
          message: "transaction not found",
        });
      }
      next();
      //check transaction on central db
  } catch (e) {
    console.log(e);
    res.status(500).end();
  }
};
