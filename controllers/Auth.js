//sendOTP
//signUp
//Login
//changePassword

const User=require("../models/User")
const OTP=require("../models/OTP")
const optGenerator=require("otp-generator")
const bcrypt=require("bcrypt")
const Profile=require("../models/Profile")
const jwt=require('jsonwebtoken')
require('dotenv').config()
const mailSender=require("../utils/mailSender")
const {passwordUpdated}=require("../mail/passwordUpdate")



//! Send Otp for Sign in
exports.sendOTP=async(req,res)=>{
  try{
      //fetch email from request body
      const {email}=req.body;

      //check if user already exist
      const checkUserPresent=await User.findOne({email})
  
      //if user already exist then return a response
      if(checkUserPresent){
          return res.status(401).json({
              success:false,
              message:"User already Registered"
          })
      }
  
      //generate Otp
      var otp=optGenerator.generate(6,{ // first arguement matlab kitne digit ka otp generate karna h .. second arguement main specification jo hame chahiye otp mein
        upperCaseAlphabets:false,
        lowerCaseAlphabets:false,
        specialChars:false,
      })
      console.log("Otp generated ",otp)

      //check unique otp or not
      let result=await OTP.findOne({otp:otp})

      while(result){
        otp=optGenerator(6,{
        upperCaseAlphabets:false,
        lowerCaseAlphabets:false,
        specialChars:false,
        })
        result=await OTP.findOne({otp:otp})
      }

      const otpPayload={email,otp}

      //create an entry in DataBase for OTP
      const otpBody=await OTP.create(otpPayload)
      console.log(otpBody)

      //return response
      res.status(200).json({
        success:true,
        message:"OTP sent Successfully",otp
      })
  }
  catch(err){
    console.log(err)
    res.status(500).json({
        success:false,
        message:err.message
    })
}
}

//SignUp Function
exports.signUp=async(req,res)=>{
    try{
        //data fetch from request body
    const {
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        accountType,
        contactNumber,
        otp
    }=req.body

    //validate the data
    if(!firstName || !lastName || !email ||!password || !confirmPassword ||!otp){
        return res.status(403).json({
            success:false,
            message:"All fields are required "
        })
    }

    // match password and confirm password
    if(password!==confirmPassword){
        res.status(400).json({
            success:false,
            message:"Password and Confirm Password does not match, please try again"
        })
    }

    //check user already exist or not
    const existingUser=await User.findOne({email})
    if(existingUser){
        return res.status(400).json({
            success:false,
            message:"User is already Registered"
        })
    }
    

    //finding most recent otp for the user
    const recentOtp=await OTP.find({email}).sort({createdAt:-1}).limit(1); // is query ki help se sirf recent otp fetch hogi
    console.log(recentOtp)

    //validate OTP
    if(recentOtp.length===0){
        //otp not found
        return res.status(400).json({
            success:false,
            message:"OTP not found"
        })
    } 
    else if(otp!==recentOtp[0].otp){
        return res.status(400).json({
            success:false,
            message:"Invalid OTP ! OTP Not Matching"
        })
    }

    //Hash password
    const hashedPassword=await bcrypt.hash(password,10)

    

    //entry create in Db
    const profileDetails=await Profile.create({
        gender:null,
        dateOfBirth:null,
        about:null,
        contactNumber:null
    })

    

    const user=await User.create(
        {firstName,
            lastName,
            additionalDetails:profileDetails._id,
            email,
            contactNumber,
            password:hashedPassword,
            accountType,
            image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName}%20${lastName}` // ye ek api h jiske ie dicebear jiske help se hum firstName, lastName ke first character ke help se profile icon bana sakte h like Lalit Bhatt ki LB

    })


    //return response
    return res.status(200).json({
        success:true,
        message:"User is Registered Successfully",user
    })
    }
    catch(err){
        console.log(err)
        return res.status(500).json({
            success:false,
            message:"user cannot be registered , Please Try again"
        })
    }
}

//Login
exports.login=async(req,res)=>{
    try{
        // jab bhi koi user login karta h to hum jwt token generate karte h or osko response ke sath send kar dete h

        //get data from request body
        const {email,password}=req.body;

        //validate data
        if(!email || !password){
            return res.status(400).json({
                success:false,
                message:"All Fields are required, Please try again"
            })
        }

        //user check exist or not
        const user=await User.findOne({email})
        if(!user){
            return res.status(401).json({
                success:false,
                message:"User is not registered, Please SignUp first"
            })
        }


        //generate jwt token after password matching
        if(await bcrypt.compare(password,user.password)){

            const payload={
                email:user.email,
                id:user._id,
                accountType:user.accountType
            }

            const token=jwt.sign({
                email:user.email,
                id:user._id,
                accountType:user.accountType
            },process.env.JWT_SECRET,{
                expiresIn:"24h"
        })
        user.token=token
        user.password=undefined;

        //create cookie and send response
        const options = {
            expires:new Date(Date.now() + 3*24*69*1000), // in milisecond
            httpOnly:true
        }

        res.cookie("token",token,options).status (200).json({
            success:true,
            token,
            user,
            message:"Logged in Successfully"
        }) // first arguemetn is cookie ka naam, second arguement is cookie ki value and third arguemtn is options
        }

        else{
            return res.status(401).json({
                success:false,
                message:"Password does not match"
            })
        }
        
    }
    catch(err){
        console.log(err)
        return res.status(500).json({
            success:false,
            message:'Login Failure, Please try again'
        })
    }
}

exports.changePassword=async(req,res)=>{
    try{
    const {email,oldPassword,newPassword,confirmPassword}=req.body

    //validate input
    if(!email || !oldPassword || !newPassword ||!confirmPassword){
        return res.status(400).json({
            success:false,
            message:"All fields are mandatory"
        })
    }

    if(newPassword!==confirmPassword){
        return res.status(400).json({
            success:false,
            message:"New Password and confirm password does not match"
        })
    }

    //find the user by email
    const user=await User.findOne({email})
    if(!user){
        return res.status(404).json({
            success:false,
            message:"User not found"
        })
    }

    //compare old password
    const isMatch=await bcrypt.compare(oldPassword,user.password)
    if(!isMatch){
        return res.status(400).json({
            success:false,
            message:"Old password is incorrect"
        })
    }

    // Hash the new Password
    const hashedPassword=bcrypt.hash(newPassword,10)
    user.password=hashedPassword

    //send confirmation email using OTP model
    await sendVerificationEmail(user.email,'Your password has been successfully Changed')

    //return a successful response
    return res.status(200).json({
        success:true,
        message:"Password changed successfully"
    })
    

}
catch(err){
    return res.status(500).json({
        success:false,
        message:"Cannot change Password",err
    })
}
}