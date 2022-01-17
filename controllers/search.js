const axios = require("axios");
const userDb = require("../models/user")
exports.searchFaculty = async (req, res, next) => {
  try {

    const {query } = req.query;
    const uri = `${process.env.centralBase}/search/for/faculty?query=${query}`;
    const { data:{results} } = await axios.get(uri);
    return res.status(200).json({
      results,
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
exports.searchDepartment = async (req, res, next) => {
  try {

    const { query } = req.query;
    const uri = `${process.env.centralBase}/search/for/department?query=${query}`;
    const { data:{results} } = await axios.get(uri);
    return res.status(200).json({
      results,
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
exports.searchSchool = async (req, res, next) => {
  try {

    const { query } = req.query;
    const uri = `${process.env.centralBase}/search/for/school?query=${query}`;
    const { data:{results} } = await axios.get(uri);
    return res.status(200).json({
      results,
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
exports.searchUser = async(req,res,next)=>{
  try{
    const {query} = req.query
    const user = await userDb.findOne({
      where:{
        email:query
      },
      attributes:["uid","email","name"]
    })
    return res.status(200).json({
      user
    })
  }catch(e){
    console.log(e)
    res.status(500).json({
      message:"an error occurred"
    })
  }
}