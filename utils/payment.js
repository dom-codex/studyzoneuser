const transactionDb = require("../models/transaction");
const nanoid = require("nanoid").nanoid;
const axios = require("axios");
exports.createTransaction = async (incomingData) => {
  const {
    title,
    uid,
    sch,
    fal,
    dept,
    lev,
    email,
    sem,
    paymentMethod,
    key,
    amount,
    user,
    TxId,
  } = incomingData;
  const studyTxId = nanoid();

  const transaction = await transactionDb.build({
    title: title,
    userEmail: email,
    transactionRef: TxId ? TxId : null,
    amount: amount, //keyResult.data.value,
    semester: sem,
    paymentMethod: paymentMethod,
    userId: user.id,
    TxId: studyTxId,
    key: key,
    school: sch,
    faculty: fal,
    department: dept,
    level: lev,
  });
  const result = await axios.post(process.env.transacUrl, {
    uid: uid,
    sid: sch,
    fid: fal,
    did: dept,
    lid: lev,
    amount: transaction.amount,
    trf: transaction.transactionRef,
    title: title,
    email: email,
    semester: transaction.semester,
    paymentMethod: transaction.paymentMethod,
    userTxId: studyTxId,
    key: key,
  });
  return { transaction: transaction, result: result };
};
