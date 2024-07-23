const Profile=require("../models/Profile")
const User=require("../models/User")
require("dotenv").config()
const {convertSecondsToDuration} =require("../utils/secToDuration")
const courseProgress=require("../models/CourseProgress")
const CourseProgress = require("../models/CourseProgress")
const {uploadImageToClodinary}=require("../utils/imageUploder")

//! hamne Auth controller mein ek demo Profile generate kari h .. to ab hame profile create karne ki nahi bas update karne ki jarurat h.. Dusra tarika vahi h ki hum is file me Profile create kare, update kare etc.

exports.updateProfile=async(req,res)=>{
    try{
        //todo -> during authentication middleware we have decoded the token and passed the decode to the req.user . so we can get userId from there

        //*get data
        const {dateOfBirth,about,contactNumber,gender}=req.body

        //get userId
        const id=req.user.id
        
        

        //validation
        if(!contactNumber ||!gender ||!id){
            return res.status(400).json({
                success:false,
                message:"All fields are mandatory"
            })
        }

        //find profile
        const userDetails=await User.findById(id)

        console.log(userDetails)

        const profileId=userDetails.additionalDetails
        const profileDetails=await Profile.findById(profileId)

        //update profile
        profileDetails.dateOfBirth=dateOfBirth
        profileDetails.about=about
        profileDetails.gender=gender
        profileDetails.contactNumber=contactNumber
        await profileDetails.save() // with this data will be updated in database

        //return response
        return res.status(200).json({
            success:true,
            message:"Profile Updated Successfully",
            profileDetails

        })

    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:"Cannot update Profile",
            error:err.message
        })
    }
}

//delete account
exports.deleteAccount=async(req,res)=>{
    try{
        //get id
        const id=req.user.id;

        //validation
        const userDetails=await User.findById(id)
        if(!userDetails){
            return res.status(404).json({
                success:false,
                message:"User not found"
            })
        }

        //delete profile
        await Profile.findByIdAndDelete({_id:userDetails.additionalDetails})

        //delete user
        await User.findByIdAndDelete({_id:id})

        //return response
        return res.status(200).json({
            success:true,
            message:"User deleted successfully"
        })
    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:"Cannot delete account",
            error:err.message
            
        })
    }
}

exports.getAllUserDetails=async(req,res)=>{
    try{
        //get user id
        const id=req.user.id

        //validation
        const userDetails=await User.findById(id).populate("additionalDetails").exec()

        //return response
        return res.status(200).json({
            success:true,
            message:"User data fetched successfully",
            data:userDetails
        })

    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:"Cannot fetch Profile data",
            error:err.message
        })
    }
}

exports.updateDisplayPicture=async(req,res)=>{
try{
    console.log("req : ",req)

    const displayPicture=req.files.displayPicture
    const userId=req.user.id
    const image=await uploadImageToClodinary(
        displayPicture,
        process.env.FOLDER_NAME,
        1000,
        1000
    )
    console.log(image)
    const updatedProfile=await User.findByIdAndUpdate(
        {_id:userId},
        {
            image:image.secure_url
        },
        {new:true}
        )

        res.status(200).json({
            success:true,
            message:'Image updated Successfully',
            data:updatedProfile

        })

}
catch(err){
    return res.status(500).json({
        success:false,
        message:err.message
    })
}
}

exports.getEnrolledCourses=async(req,res)=>{
    try{
        const userId=req.user.id
        let userDetails=await User.findOne({
            _id:userId
        })
        .populate({
            path:"courses",
            populate:{
                path:"courseContent",
                populate:{
                    path:"subSection"
                }
            }
        })
        .exec()

        userDetails=userDetails.toObject()
        var SubSectionLength=0
        for(var i=0;i<userDetails.courses.length;i++){
            let totalDurationInSeconds=0
            SubSectionLength=0
            for(var j=0;j<userDetails.courses[i].courseContent;j++){
                totalDurationInSeconds+=userDetails.courses[i].courseContent[j].subSection.reduce((acc,curr)=>
                    acc+parseInt(curr.timeDuration),0)
                userDetails.courses[i].totalDuration=convertSecondsToDuration(totalDurationInSeconds)

                SubSectionLength+=userDetails.courses[i].courseContent[j].subSection.length
            }
            let courseProgressCount=await CourseProgress.findOne({
                courseId:userDetails.courses[i]._id,
                userId:userId
            })
            courseProgressCount=courseProgressCount?.completedVideos.length
            if(SubSectionLength===0){
                userDetails.courses[i].progressPercentage=100
            }
            else{
                const multiplier=Math.pow(10,2)
                userDetails.courses[i].progressPercentage=Math.round(
                    (courseProgressCount/SubSectionLength)*100*multiplier
                )/multiplier
            }
        }

        if(!userDetails){
            return res.status(400).json({
                success:false,
                message:`Could not find user with id : ${userDetails}`
            })
        }

        return res.status(200).json({
            success:true,
            data:userDetails.courses
        })
        
    }
    catch(error){
        return res.status(500).json({
            success: false,
            message: error.message,
          })
    }
}