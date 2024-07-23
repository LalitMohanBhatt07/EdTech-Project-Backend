const SubSection=require("../models/SubSection")
const Section=require("../models/Section")
const { uploadImageToClodinary } = require("../utils/imageUploder")

//create Subsection
exports.createSubSection=async(req,res)=>{
    try{
        //fetch data from request data
        const {sectionId,title,timeDuration,description}=req.body

        //extract video from file
        const videoFile=req.files.videoFile// here let file of video is videoFile

        //validation
        if(!sectionId ||!title ||!timeDuration ||!description){
            return res.status(400).json({
                success:false,
                message:"All fields are mandatory"
            })
        }

        //upload video to cloudinary becuae we need url of video
        const uploadDetails=await uploadImageToClodinary(videoFile,process.env.FOLDER_NAME) // upload karke hame secure url uploadDetails ke andar mil jayega

        //create subsection
        const subSectionDetails=await SubSection.create({
            title:title,
            timeDuration:timeDuration,
            description:description,
            videoUrl:uploadDetails.secure_url
        })

        //update section with this subsection objectId
        const updatedSection=await Section.findByIdAndUpdate({_id:sectionId},{
            $push:{
                subSection:subSectionDetails._id
            }
        },{
            new:true
        })

        //return response
        return res.status(200).json({
            success:true,
            message:"Sub Section Created Successfully",
            updatedSection
        })
    }
    catch(err){
        console.error(err)
        return res.status(500).json({
            success:false,
            message:"Cannot create new Sub section",
            error:err.message
        })
    }
}

//updated Subsection

exports.updateSubSection=async(req,res)=>{
    try{
        const {subSectionId,title,timeDuration,description}=req.body
        const videoFile=req.files.videoFile

        //validation
        if(!subSectionId){
            return res.status(400).json({
                success:false,
                message:"SubSection Id is required"
            })
        }

        const uploadDetails=await uploadImageToClodinary(videoFile,process.env.FOLDER_NAME)

        const updatedSubSectionDetails=SubSection.findByIdAndUpdate({subSectionId},{$push:{
            title:title,timeDuration:timeDuration,description:description,videoUrl:uploadDetails
        }},{new:true})

        //return response
        return res.status(200).json({
            success:true,
            message:"SubSection Updated successfully",
            updatedSubSectionDetails
        })
    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:"Cannot Update Sub section",
            error:err.message
        })
    }
}

//delete Subsection

exports.deleteSubSection=async(req,res)=>{
    try{
        const {subSectionId}=req.params

        await SubSection.findByIdAndDelete(subSectionId)

        return res.status(200).json({
            success:true,
            message:"SubSection Deleted Successfully"
        })
    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:"Cannot delete Sub section",
            error:err.message
        })
    }
}