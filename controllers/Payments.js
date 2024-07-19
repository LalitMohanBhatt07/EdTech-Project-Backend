//! step 1 -> install razorpay using npm i razorpay

//!step 2 -> create instance of razorpay inside config folder and import it

const {instance}=require("../config/razorpay")
const Course=require("../models/Course")
const User=require("../models/User")
const mailSender=require("../utils/mailSender")
const {courseEnrollmentEmail}=require("../mail/courseEnrollmentEmail")


// todo : Capture the payment and initiate the Razorpay order
exports.capturePayment=async(req,res)=>{

    // get course id and user id
    //! jab hamne auth middleware banaya tha to hamne req ke andar payload ko insert kiya tha to vaha se hum user.id nikal sakte h
    const {course_id}=req.body;
    const userId=req.user.id;

    //validation
    //valid courseId
    if(!course_id){
        return res.json({
            success:false,
            message:"Please provide valid course id"
        })
    } 

    //valid courseDetails
    let course;
    try{
        course=await Course.findById(course_id)
        if(!course){
            return rs.json({
                success:false,
                message:"Could not find the course"
            })
        }

        //user already paid for same course
    //! Course model ke andar students enrolled naam ka ek data available h jiske help se hum check kar sakte h ki kya user ne already course purchase kara h ya nahi
    //! in Course model the userId is in object format but now my userId is in string . thus we have to convert userId into object id
    const uid=new mongoose.Types.ObjectId(userId)
    if(course.studentsEnrolled.includes(uid)){
        return res.status(200).json({
            success:false,
            message:"Student is already enrolled"
        })
    }


    
    }
    catch(err){
        console.error(err)
        return res.status(500).json({
            success:false,
            message:err.message
        })
    }

    //create order
    const amount=course.price
    const currency="INR"
    const options={
        amount:amount*100,
        currency,
        receipt:Math.random(Date.now()).toString(),
        notes:{
            courseId:course_id,
            userId
        }
    }

    try{
        //initiate the payment using razorpay
        const paymentResponse=await instance.orders.create(options)
        console.log(paymentResponse)

        return res.status(200).json({
            success:true,
            courseName:course.courseName,
            courseDescription:course.courseDescription,
            thumbnail:course.thumbnail,
            orderId:paymentResponse.id,
            currency:paymentResponse.currency,
            amount:paymentResponse.amount
        })
    }
    catch(err){
        console.log(err)
        res.json({
            success:false,
            message:"could not initiate order"
        })

    }
}
 
//! in above handler function we initiated/created the payment with the help of creating the order

//!Now we will verify the signature

//verify signature of razorpay and server

exports.verifySignature=async(req,res)=>{
    
}
