
//create categories ka handler function

const Category = require("../models/Category")
const Course = require("../models/Course")

exports.createCategory=async(req,res)=>{
    try{
        //fetch data
        const {name,description}=req.body

        //validation

        if(!name ||!description){
            return res.status(400).json({
                success:false,
                message:"All Fields are required"
            })
        }

        //create entry in DB
        const categoryDetails=await Category.create({
            name:name,
            description:description
        })

        console.log(categoryDetails)

        //return 
        return res.status(200).json({
            success:true,
            message:"Category created Successfully"
        })
    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:err.message
        })
    }
}


//get all categories handler 
exports.showAllCategories=async(req,res)=>{
    try{
        const allCategory=await Category.find({},{name:true,description:true})// iska matlab ye hota h ki sare data show karo par make sure karna ki jo bhi data hoga osme name,description compulsarily ho.

        res.status(200).json({
            success:true,
            message:"All Categories returned Successfullt",allCategory
        })
    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:err.message
        })
    }
}

//category page details

exports.categoryPageDetails=async(req,res)=>{
    try{
        //get category id
        const {categoryId}=req.body;

        // get all courses related to that category
        const selectedCategory=await Category.findById(categoryId).populate("courses").exec()

        //validation
        if(!selectedCategory){
            return res.status(404).json({
                success:false,
                message:"Data not found"
            })
        }

        //get course for different category
        const differentCategories=await Category.find({
            _id:{$ne:categoryId}
    }).populate("courses").exec()

        //get top selling courses
        const topSellingCourses=await Course.find().sort({studentsEnrolled:"desc"}).limit(5).exec()

        //return response

        return res.status(200).json({
            success:true,
            data:{
                selectedCategory,
                differentCategories,
                topSellingCourses
            }
        })
    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:err.message
        })
    }
}