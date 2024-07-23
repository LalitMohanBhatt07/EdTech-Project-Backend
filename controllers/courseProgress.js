const mongoose=require("mongoose")
const Section=require("../models/Section")
const SubSection=require("../models/SubSection")
const CourseProgress=require("../models/CourseProgress")
const Course=require("../models/Course")


//update course progress
exports.updateCourseProgress=async(req,res)=>{
        const {courseId,subSectionId}=req.body

        const userId=req.user.id

        try{
            //check if subsection is valid
            const subsection=await SubSection.findById(subSectionId)
            if(!subsection){
                return res.status(400).json({
                    success:false,
                    message:"Invalid SubsectionId"
                })
            }

            //find the course progress document for the user and course
            let courseProgress=await CourseProgress.findOne({
                courseID:courseId,
                userID:userId
            })

            console.log("courseProgress : ",courseProgress)

            if(!courseProgress){
                return res.status(404).json({
                    success:false,
                    message:"Course progress does not exist !",
                    courseId,
                    userId
                })
            }
            else{
                //if course progress exists, check the subsection is already completed

                if(courseProgress.completedVideos.includes(subSectionId)){
                    return res.status(400).json({
                        success:false,
                        error:"Subsection already completed"
                    })
                }

                //push the subsection into the completedVideos array
                CourseProgress.completedVideos.push(subSectionId)
            }

            //save teh updated course progress
            await CourseProgress.save()

            return res.status(200).json({
                success:true,
                message:"Course Progress updated",
                courseProgress
            })
        }
    
    catch(err){
        console.error(err)
    return res.status(500).json({
         success:false,
         error: "Internal server error" 
        })
    }
}
