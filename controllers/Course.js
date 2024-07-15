const Course=require("../models/Course")
const Tags=require("../models/Tags")
const User = require("../models/User")
const user=require("../models/User")
const {uploadImageToClodinary}=require("../utils/imageUploder")

//create Course handler function
exports.createCourse=async(req,res)=>{
     try{
        //payload ke andar id daal rakhi h auth middleware ke andar thus we can get id from req.body
        //dusra tarika yeh hi ki hum db call karke id le sakte h
        const {courseName,courseDescription,whatYouWillLearn,price,tag}=req.body

        //get thumbnail
        const thumbnail=req.files.thumbnailImage

        //validation
        if(!courseName || !courseDescription || !whatYouWillLearn ||!price ||!tag ||!thumbnail){
            res.status(400).json({
                success:false,
                message:'All Fields are mandatory'
            })
        }

        // check for instructor : 
        const userId=req.user.id //payload ke andar se 
        const instructorDetails=await User.findById(userId)
        console.log("Instuctor Details : ",instructorDetails)

        if(!instructorDetails){
            res.status(404).json({
                success:false,
                message:"Instructor Details not found"
            })
        }

        //check given tag is valid or not
        // req ki body se jo tag milega vo course.js model mein object reference form mein h to hame id milegi
        const tagDetails=Tags.findById(tag)// ye tag id hoge 
        if(!tagDetails){
            res.status(404).json({
                success:false,
                message:"Tag Details not found"
            })
        }

        //upload image to cloudinary 
        const thumbnailImage=await uploadImageToClodinary(thumbnail,process.env.FOLDER_NAME) // here thumbnail is the file name and other is folder name

        //create an entry for new course
        const newCourse=await Course.create({
            courseName,courseDescription,instructor:instructorDetails._id,
            whatYouWillLearn,
            price,
            tag:tagDetails._id,
            thumbnail:thumbnailImage.secure_url
        })

        //add the new course to the user schema of instructor
        await User.findByIdAndUpdate({_id:instructorDetails._id},{
            $push:{
                courses:newCourse._id
            }
        },
    {new:true})

    //update the tag Schema
    await Tags.findByIdAndUpdate({
        _id:tagDetails._id
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