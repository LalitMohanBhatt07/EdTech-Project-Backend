const jwt=require("jsonwebtoken")
require("dotenv").config()
const User=require("../models/User")


//auth -> auth ke andar hum authentication check karte the jiske liye hum json web token verify karte the. We can extract token from body,cookie,bearer. Best practise is bearer and wrost practise is body.
exports.auth=async(req,res,next)=>{
    try{
        //extract token
        const token=req.cookies.token ||
         req.body.token ||
         req.header("Authorization").replace("Bearer","")
         
         console.log("TOKEN IS AUTH extraction : ",token)

         // if token is missing , then return response
         if(!token){
            return res.status(400).json({
                success:false,
                message:"Token is missing"
            })
         }

         //verify the token using secret key
         try{
            const decode=jwt.verify(token,process.env.JWT_SECRET)

            console.log(decode)

            req.user=decode;
         }
         catch(err){
            //verification issue
            return res.status(401).json({
                success:false,
                message:"Token is Invalid"
            })
         }
         next();

    }
    catch(err){
        console.log(err)
        return res.status(401).json({
            success:false,
            message:"Something went wrong while validating the token",
            error:err.message
        })
    }
}

//isStudent
exports.isStudent=async(req,res,next)=>{
    try{
        // ek tarika ye h ki hum role ko req.body ke andar se access kar lenge
        if(req.user.accountType !=="Student"){
            return res.status(401).json({
                success:false,
                message:"this is protected route for student only"
            })
        }
        next()
    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:"User role cannot be verified"
        })
    }
}


//isInstructor
exports.isInstructor=async(req,res,next)=>{
    try{
        // ek tarika ye h ki hum role ko req.body ke andar se access kar lenge
        if(req.user.accountType !=="Instructor"){
            return res.status(401).json({
                success:false,
                message:"this is protected route for Instructor only"
            })
        }
        next()
    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:"User role cannot be verified"
        })
    }
}

//isAdmin
exports.isAdmin=async(req,res,next)=>{
    try{
        // ek tarika ye h ki hum role ko req.body ke andar se access kar lenge
        if(req.user.accountType !=="Admin"){
            return res.status(401).json({
                success:false,
                message:"this is protected route for Admin only"
            })
        }
        next()
    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:"User role cannot be verified"
        })
    }
}