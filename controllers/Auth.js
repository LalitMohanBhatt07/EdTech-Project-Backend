//sendOTP
//signUp
//Login
//changePassword

const User=require("../models/User")
const OTP=require("../models/OTP")
const optGenerator=require("otp-generator")
const bcrypt=require("bcrypt")
const Profile=require("../models/Profile")

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
        res.status(400).json({
            success:false,
            message:"User is already Registered"
        })
    }

    //finding most recent otp for the user
    const recentOtp=await OTP.find({email}).sort({createdAt:-1}).limit(1); // is query ki help se sirf recent otp fetch hogi
    console.log(recentOtp)

    //validate OTP
    if(recentOtp.length==0){
        //otp not found
        return res.status(400).json({
            success:false,
            message:"OTP not found"
        })
    } 
    else if(otp!==recentOtp){
        res.status(400).json({
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

    const user=await User.create({firstName,lastName,email,contactNumber,password:hashedPassword,accountType,additionalDetails:profileDetails._id,//profileDetail ki id additionalDetail mein save kar denge
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
        res.status(500).json({
            success:false,
            message:"user cannot be registered , Please Try again"
        })
    }
}