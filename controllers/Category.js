
//create categories ka handler function

const Category = require("../models/Category")

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