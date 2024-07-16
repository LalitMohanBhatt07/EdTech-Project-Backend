const Section=require("../models/Section")
const Course=require("../models/Course")

exports.createSection=async(req,res)=>{
     try{
        //data fetch
        const {sectionName,courseId}=req.body

        //data validation
        if(!sectionName || !courseId){
            return res.status(400).json({
                success:false,
                message:"All Fields are required"
            })
        }

        //create section
        const newSection=await Section.create({
            sectionName
        })

        //update course with seciton objectID
        const updatedCourseDetails=await Course.findByIdAndUpdate({courseId},{$push:{
            courseContent:newSection._id
        }},
    {
        new:true
    })

        //return response
        return res.status(200).json({
            success:true,
            message:"Section created successfully",
            updatedCourseDetails
        })
     }
     catch(err){

        return res.status(500).json({
            success:false,
            message:"Cannot create new Section",
            error:err.message
        })
     }
}