const userDb = require("../models/user");
const _generateOtp = (n)=>{
const digits = "0123456789";
let otp = "";
for(let i = 0; i < n; i++){
    otp+= digits[Math.floor(Math.random()*10)];
}
return otp;
}
exports.generateOtp = (n=6)=>{
    return _generateOtp(n)
    /*let continueLooping = true;
    let otp = ""
    while(continueLooping){
        otp = _generateOtp();
        const alreadyExists = await keysDb.findOne({
            where:{
                key:otp
            }
        })
        if(alreadyExists==null){
            break;
        }
    }
    return otp;*/
}
exports.generateActivationCode = async(n=5)=>{
    let continueLooping = true
    while(continueLooping){
        const code = _generateOtp(n);
        //CHECK IF CODE HAS ALREADY BEEN GENERATED
        const alreadyExists = await userDb.findOne({
            where:{
                activationCode:code
            },
            attributes:["id"]
        })
        if(!alreadyExists){
            continueLooping = false;
            return code;
        }
    }   
}
exports.generateReferralCode = async(n=6)=>{
    let continueLooping = true
    while(continueLooping){
        const code = _generateOtp(n);
        //CHECK IF CODE HAS ALREADY BEEN GENERATED
        const alreadyExists = await userDb.findOne({
            where:{
                referral:code
            },
            attributes:["id"]
        })
        if(!alreadyExists){
            continueLooping = false;
            return code;
        }
    }
}