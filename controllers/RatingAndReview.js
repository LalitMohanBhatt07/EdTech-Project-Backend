const RatingAndReview=require("../models/RatingAndReview")
const Course=require("../models/Course")

//todo : create Rating
exports.createRating=async(req,res)=>{
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
exports.getAverageRating=async (req,res)=>{
    try{
        //get course id
        const courseId=req.body.courseId;

        //calculate average rating
        const result=await RatingAndReview.aggregate([
            {
                $match:{
                    course:new mongoose.Types.ObjectId(courseId) // todo : ese course mereko find karke do jiski courseId is courseId ki tarah ho

                }
            },
            {
                $group:{
                    _id:null, // jitne entry aaye the osko single group mein wrap kar diya,
                    averageRating:{$avg:"$rating"}
                }
            }
        ])
        //return rating
        if(result.length>0){
            return res.status(200).json({
                success:true,
                averageRating:result[0].averageRating,
                averageRating:0
            })
        }

        //if no rating review exist
        return result.status(200).json({
            success:true,
            message:"Average rating is 0, no rating given till now"
        })
    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:err.message
        })
    }

}


//todo : get all rating and reviews
exports.getAllRatingAndReviews=async (req,res)=>{
    try{
        const allReviews=await RatingAndReview.find({}).sort({rating:"desc"}).populate({
            path:"user",
            select:"firstName lastName email image" // user ke andar sirf ye fields populate karna
        }).populate({
            path:"course",
            select:"courseName"
        })
        // rating descendign order mein la dena

        return res.status(200).json({
            success:true,
            message:"All Reviews fetched successfully",
            data:allReviews
        })
        
    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:err.message
        })
    }
}