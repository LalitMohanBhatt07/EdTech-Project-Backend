const Course=require("../models/Course")
const Category=require("../models/Category")
const User = require("../models/User")
const user=require("../models/User")
const {uploadImageToClodinary}=require("../utils/imageUploder")
const CourseProgress = require("../models/CourseProgress")
const SubSection = require("../models/SubSection")
const Section = require("../models/Section")
require("dotenv").config()

//create Course handler function
exports.createCourse=async(req,res)=>{
     try{
        //payload ke andar id daal rakhi h auth middleware ke andar thus we can get id from req.body
        //dusra tarika yeh hi ki hum db call karke id le sakte h
        const {courseName,courseDescription,whatYouWillLearn,price,category}=req.body

        //get thumbnail
        const thumbnail=req.files.thumbnailImage

        //validation
        if(!courseName || !courseDescription || !whatYouWillLearn ||!price ||!category ||!thumbnail){
            return res.status(400).json({
                success:false,
                message:'All Fields are mandatory'
            })
        }

        // check for instructor : 
        const userId=req.user.id //payload ke andar se 
        const instructorDetails=await User.findById(userId)
        console.log("Instuctor Details : ",instructorDetails)

        if(!instructorDetails){
            return res.status(404).json({
                success:false,
                message:"Instructor Details not found"
            })
        }

        //check given category is valid or not
        // req ki body se jo category milega vo course.js model mein object reference form mein h to hame id milegi
        const categoryDetails=await Category.findById(category)// ye category id hoge 
        if(!categoryDetails){
            return res.status(404).json({
                success:false,
                message:"Category Details not found"
            })
        }

        //upload image to cloudinary 
        const thumbnailImage=await uploadImageToClodinary(thumbnail,process.env.FOLDER_NAME) // here thumbnail is the file name and other is folder name

        //create an entry for new course
        const newCourse=await Course.create({
            courseName,courseDescription,instructor:instructorDetails._id,
            whatYouWillLearn,
            price,
            category:categoryDetails._id,
            thumbnail:thumbnailImage.secure_url
        })

        //add the new course to the user schema of instructor
        await User.findByIdAndUpdate({_id:instructorDetails._id},{
            $push:{
                courses:newCourse._id
            }
        },
    {new:true})

    //update the category Schema
    await Category.findByIdAndUpdate({
        _id:categoryDetails._id
    },
    {
        $push:{
            courses:newCourse._id
        }
    },
{
    new:true
})


    return res.status(200).json({
        success:true,
        message:"Course Created Successfully",
        data:newCourse
    })
     }
     catch(err){
        console.error(err)
        return res.status(500).json({
            success:false,
            message:'Failed to create course',
            err:err.message
        })
     }
}

//getAllCourses Handler Function

exports.getAllCourses=async(req,res)=>{
    try{
        const allCourses=await Course.find({})

        return res.status(200).json({
            success:true,
            message:"Data for all courses fetched successfully",
            data:allCourses
        })
    }
    catch(err){
        console.log(err)
        res.status(500).json({
            success:false,
            message:"Cannot fetch all Courses",
            error:err.message
        })
    }
}

//getCourseDetails
exports.getCourseDetails=async(req,res)=>{
    try{
        //get id
        const {courseId}=req.body
        //find cours details
        const courseDetails=await Course.find({_id:courseId}).populate(
            {
            path:"instructor",
            populate:{
                path:"additionalDetails"
            }
        })
        .populate("category")
        .populate("ratingAndReviews")
        .populate({
                path:"courseContent",
                populate:{
                    path:"subSection"
                }
    })
    .exec()

    //validation
    if(!courseDetails){
        return res.status(400).json({
            success:false,
            message:`Could not find the course with ${courseId}`
        })
    }

    return res.status(200).json({
        success:true,
        message:"Course Details fetched successfully",
        data:courseDetails
    })
    }
    catch(err){
        console.log(err)
        return res.status(500).json({
            success:false,
            message:err.message
        })
    }
}

exports.editCourse=async(req,res)=>{
    try{
        const {courseId}=req.body
        const updates=req.body
        const course=await Course.findById(courseId)

        if(!course){
            return res.status(404).json({
                success:false,
                message:"course does not found!",
            })
        }

        //if thumbnail image is found update it
        if(req.files){
            console.log("thumbnail update")
            const thumbnail=req.files.thumbnailImage
            const thumbnailImage=await uploadImageToClodinary(thumbnail,process.env.FOLDER_NAME)
            course.thumbnail=thumbnailImage.secure_url
        }

        //update only the fields that are present in the request body
        for(const key in updates){
            if(updates.hasOwnProperty(key)){
                if(key=="category"||key=="instructions"){
                    course[key]==JSON.parse(updates[key])
                } else{
                    course[key]=update[key]
                }
            }
        }

        await course.save()

        const updatedCourse=await Course.findOne({
            _id:courseId
        })
        .populate({
            path:"instructor",
            populate:{
                path:"additionalDetails"
            }
        })
        .populate("category")
        .populate("ratingAndReviews")
        .populate({
            path:"courseContent",
            populate:{
                path:"subSection"
            }
        })
        .exec()

        res.status(200).json({
            success:true,
            message:"Course updated successfully",
            data:updatedCourse
        })
    }
    catch(err){
        console.error(err)
        res.status(500).json({
            success:false,
            message:"Cannot edit course",
            error:err.message
        })
    }
}

//get Full Course Detail : 
exports.getFullCourseDetails=async(req,res)=>{
    try{
        const {courseId}=req.body
        console.log("CourseId : ",courseId)
        const userId=req.user.id
        const courseDetails=await Course.findOne({
            _id:courseId
        }).populate({
            path:"instructor",
            populate:{
                path:"additionalDetails"
            }
        })
        .populate("category")
        .populate("ratingAndReviews")
        .populate({
            path:"courseContent",
            populate:{
                path:"subSection"
            }
        })
        .exec()

        let courseProgressCount=await CourseProgress.findOne({
            courseID:courseId,
            userID:userId
        })

        console.log("Course Progress Count: ",courseProgressCount)

        if(!courseDetails){
            return res.status(400).json({
                success:false,
                message:`Could not find course with id : ${courseId}`
            })
        }

        let totalDurationInSeconds=0
        courseDetails.courseContent.forEach((content)=>{
            content.subSection.forEach((subSection)=>{
                const timeDurationInSeconds=parseInt(subSection.timeDuration)
                totalDurationInSeconds+=timeDurationInSeconds
            })
        })

        const totalDuration=convertSecondsToDuration(totalDurationInSeconds)

        return res.status(200).json({
            success:true,
            data:{
                courseDetails,
                totalDuration,
                completedVideos:courseProgressCount?.completedVideos?courseProgressCount?.completedVideos:[],
            }
        })
        
    }
    catch(error)
    {
        return res.status(500).json({
            success: false,
            message: error.message,
          }
        )
    }
}

exports.getInstructorCourses=async(req,res)=>{
        try{
            //get instructor ID from the authenticated user or request body
            const instructorId=req.user.id

            //Find all courses belonging to the instructor
            const instructorCourses=await Course.find({
                instructor:instructorId
            }).sort({createdAt:-1})

            //return the instructor courses
            res.status(200).json({
                success:true,
                data:instructorCourses
            })
        }
        catch(error)
        {
            console.error(error)
            res.status(500).json({
		success: false,
		message: "Failed to retrieve instructor courses",
		error: error.message,
	  })
	}
}

//Delete the course
exports.deleteCourse=async(req,res)=>{
    try{
        const {courseId}=req.body

        //find course
        const course=await Course.findById(courseId)

        if(!course){
            return res.status(404).json({
                success:false,
                message:"Course not found !"
            })
        }

        //Unenroll students from the course
        const studentsEnrolled=course.studentsEnrolled
        for(const studentId of studentsEnrolled){
            await User.findByIdAndUpdate(studentId,{
                $pull:{courses:courseId}
            })
        }

        //delete sections and subsections
        const courseSections=course.courseContent
        for (const sectionId of courseSections){
            const section=await Section.findById(sectionId)
            if(section){
                const subSections=section.subSection
                for (const subSectionId of subSections){
                    await SubSection.findByIdAndDelete(subSectionId)
                }
            }
            await Section.findByIdAndDelete(sectionId)
        }

        //delete the course
        await Course.findByIdAndDelete(courseId)

        return res.status(200).json({
            success:true,
            message:"Course deleted successfully"
        })
    }
    catch(error){
        console.error(error)
	  return res.status(500).json({
		success: false,
		message: "Server error",
		error: error.message,
	  })

    }
}
        