const RatingAndReview=require("../models/RatingAndReview")
const Course=require("../models/Course")

//todo : create Rating
exports.createRaing=async(req,res)=>{
    try{
        //get user id
        const userId=req.user.id //! auth wale middleware ke payload ke andar data h

        //fetchData from req body
        const {rating,review,courseId}=req.body

        //check if user is enrolled or not
        const courseDetails=await Course.findOne(
            {_id:courseId,
            studentsEnrolled:{$elementMatch:{$eq:userId}}

    })

    if(!courseDetails){
        return res.status(404).json({
            success:false,
            message:"Student is not enrolled in this course"
        })
    }

        //check if user already reviewed the course
        const alreadyReviewed=await RatingAndReview({user:userId,
                        course:courseId
        })

        if(!alreadyReviewed){
            return res.status(403).json({
                success:false,
                message:"Course is already reviewed by the user"
            })
        }

        //create rating and review
        const ratingReview=await RatingAndReview.create({
            rating,review,
            course:courseId,
            user:userId
        })

        //update course with this rating and review
        const updatedCourseDetails=await Course.findByIdAndUpdate({_id:courseId},{
            $push:{
                ratingAndReviews:ratingReview._id
            }
        },{new:true})

        console.log(updatedCourseDetails)

        //return response
        return res.status(200).json({
            success:true,
            message:"Rating and Reviews created successfully",
            ratingReview
        })

    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:err.message
        })
    }
}


 //todo : get average rating
// exports.getAverageRating=async (req,res)=>{
//     try{
//         //get course id
//         const courseId=req.body.courseId;

//         //calculate average rating


//         //return rating
//     }
//     catch(err){
//         return res.status(500).json({
//             success:false,
//             message:err.message
//         })
//     }

// }


//todo : get all rating