const Profile=require("../models/Profile")
const User=require("../models/User")

//! hamne Auth controller mein ek demo Profile generate kari h .. to ab hame profile create karne ki nahi bas update karne ki jarurat h.. Dusra tarika vahi h ki hum is file me Profile create kare, update kare etc.

exports.updateProfile=async(req,res)=>{
    try{
        //todo -> during authentication middleware we have decoded the token and passed the decode to the req.user . so we can get userId from there

        //*get data
        const {dateOfBirth="",about="",contactNumber,gender}=req.body

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
        const profileId=userDetails.AdditionalDetails
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
        await Profile.findByIdAndDelete({_id:userDetails.AdditionalDetails})

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
            
        })
    }
}

