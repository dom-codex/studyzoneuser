const axios = require("axios");
exports.searchSchool = async (req, res, next) => {
  try {

    const { school } = req.query;
    const uri = `${process.env.centralBase}/search/schools?school=${school}`;
    const { data } = await axios.get(uri);
    return res.status(200).json({
      schools: data.schools,
      code: 200,
      message: "success",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      code: 500,
      message: "success",
    });
  }
};
