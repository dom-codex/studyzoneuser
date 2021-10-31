const axios = require("axios");
const transactionDb = require("../models/transaction");
const sequelize = require("sequelize");
const user = require("../models/user");
exports.getUniversities = async (req, res, next) => {
  try {
    const { user, canProceed } = req;
    const { page, type } = req.query;
    if (!canProceed) {
      return res.json({
        code: 404,
        message: "user not found",
      });
    }
    const uri = `${process.env.centralBase}/user/get/school?type=${type}&page=${page}`;
    const { data } = await axios.get(uri);
    if (data.code != 200) {
      return res.json({
        code: data.code,
        message: data.message,
      });
    }
    res.json({
      code: 200,
      message: "success",
      schools: data.schools,
    });
  } catch (e) {
    console.log(e);
    res.status(500).end();
  }
};
exports.getFaculty = async (req, res, next) => {
  try {
    const { user, canProceed } = req;
    const { sch, page } = req.query;
    if (!canProceed) {
      return res.json({
        code: 404,
        message: "user not found",
      });
    }
    const uri = `${process.env.centralBase}/user/get/school/faculty?sch=${sch}&page=${page}`;
    const { data } = await axios.get(uri);
    res.status(200).json({
      code: 200,
      message: "success",
      faculties: data.faculties,
    });
  } catch (e) {
    console.log(e);
    res.status(500).end();
  }
};
exports.getDepartment = async (req, res, next) => {
  try {
    const { canProceed } = req;
    const { page, sch, faculty } = req.query;
    if (!canProceed) {
      return res.json({
        code: 404,
        message: "user not found",
      });
    }
    const uri = `${process.env.centralBase}/user/get/school/faculty/department?sch=${sch}&fid=${faculty}&page=${page}`;
    const { data } = await axios.get(uri);
    res.status(200).json({
      code: 200,
      departments: data.departments,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json();
  }
};
exports.getDepartmentLevels = async (req, res, next) => {
  try {
    const { canProceed } = req;
    const { page, sch, faculty, department } = req.query;
    if (!canProceed) {
      return res.json({
        code: 404,
        message: "user not found",
      });
    }
    const uri = `${process.env.centralBase}/user/get/school/faculty/department/levels?sch=${sch}&fid=${faculty}&did=${department}&page=${page}`;
    const { data } = await axios.get(uri);
    res.status(200).json({
      code: 200,
      levels: data.levels,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json();
  }
};
exports.getPastquestions = async (req, res, next) => {
  try {
    const { canProceed } = req;
    const { sch, faculty, department, level, semester, page } = req.query;
    const { user } = req;
    if (!canProceed) {
      return res.json({
        code: 404,
        message: "user not found",
      });
    }
    //make call to central db
    const uri = `${process.env.centralBase}/user/get/pastquestions?sch=${sch}&fid=${faculty}&did=${department}&lid=${level}&semester=${semester}&page=${page}`;
    const { data } = await axios.get(uri);
    //get price of pastquestion

    //verify user purchase
    //check user payment status
    const paymentHistory = await transactionDb.findOne({
      where: {
        [sequelize.Op.and]: [
          { userId: user.id },
          { userEmail: user.email },
          { semester: semester },
          { school: sch },
          { faculty: faculty },
          { department: department },
          { level: level },
        ],
      },
      attributes: ["TxId"],
    });
    let hasPaid = paymentHistory == null ? false : true;
    const freetrialstatusUri = `${process.env.centralBase}/get/freetrial/status`
    const freetrialstatus = await axios.get(freetrialstatusUri)

    if (!hasPaid) {
      return res.status(200).json({
        code: 200,
        pastquestions: data.pastquestions,
        pricing: data.pricing,
        hasPaid,
        freeTrialActive: user.freeTrialOn&&freetrialstatus.data.value=="true"?true:false,
      });
    }
    //verify payment from central dp
    const verifyUri = `${process.env.centralBase}/user/verify/payment`;
    const result = await axios.post(verifyUri, {
      user: user.uid,
      transactionId: paymentHistory.TxId,
    });

    res.status(200).json({
      code: 200,
      pastquestions: data.pastquestions,
      pricing: data.pricing,
      hasPaid: hasPaid && result.data.transaction != null ? true : false,
      freeTrialActive: user.freeTrialOn,
    });
  } catch (e) {
    console.log(e);
    res.status(500).end();
  }
};
