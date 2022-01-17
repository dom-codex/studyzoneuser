const router = require("express").Router()
const axios = require("axios")
const { verifyUser } = require("../verification/userVerification")
const getSettings = async(req,res,next)=>{
try{
    const {name}  = req.query
    const uri = `${process.env.centralBase}/settings/get/setting?name=${name}`
    const {data:{setting}} = await axios(uri)
    return res.status(200).json({
        name:setting.name,
        value:setting.value.toString()
    })

}catch(e){
    console.log(e)
    res.status(500).json({
        message:"an error occurred"
    })
}
}
router.get("/get/setting",verifyUser,getSettings)
module.exports = router