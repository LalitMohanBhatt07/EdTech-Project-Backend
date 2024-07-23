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
        const updatedCourseDetails=await Course.findByIdAndUpdate({_id:courseId},{$push:{
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


exports.updateSection=async(req,res)=>{
    try{
        //data input
        const {sectionName,sectionId}=req.body

        //validation
        if(!sectionName || !sectionId){
            return res.status(400).json({
                success:false,
                message:"All Fields are required"
            })
        }

        //update data
        const updatedSection=await Section.findByIdAndUpdate(sectionId,{
            sectionName
        },{
            new:true
        })
        

        //return response
        return res.status(200).json({
            success:true,
            message:"Section Updated successfully",
            updatedSection
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

exports.deleteSection=async(req,res)=>{
    try{
        //get id -> id hum bahut jagah se le sakte h jaise req.body se, parameters se.
        //Assuming that we are sending ID in params
        const {sectionId}=req.params    

        //use findByIDAndDelete
        await Section.findByIdAndDelete(sectionId)

        //return response
        return res.status(200).json({
            success:true,
            message:"Section Deleted Successfully"
        })
    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:"Cannot delete section",
            error:err.message
        })
    }
}