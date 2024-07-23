const mongoose=require("mongoose");
const mailSender = require("../utils/mailSender");
const otpTemplate=require("../mail/emailVerificationTemplate")

const otpSchema=new mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    otp:{
        type:String,
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now(),
        expires:5*60
    }
})

// function to send emails

async function sendVerificationEmail(email,otp){
    try{
        const mailResponse=await mailSender(email,"Verification Email from Study Notion",otpTemplate(otp))
        console.log("Email send successfully : ",mailResponse)
    }
    catch(err){
        console.log("error occured while sending mails ",err)
        throw err;
    }
}

otpSchema.pre("save",async function(next){ // otpSchema.pre mein pre matlab database mein entry hone se pehle ye action perform kar dena .. kyonki pahle otp confirmation hogi tab jake user databases mein save hoga
    await sendVerificationEmail(this.email,this.otp)
    next() // next middleare par chale jao
})

module.exports=mongoose.model("OTP",otpSchema)