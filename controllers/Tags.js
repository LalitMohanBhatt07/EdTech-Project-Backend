const Tags=require("../models/Tags")

//create tag ka handler function

exports.createTag=async()=>{
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
        const tagDetails=await Tags.create({
            name:name,
            description:description
        })

        console.log(tagDetails)

        //return 
        return res.status(200).json({
            success:true,
            message:"Tag created Successfully"
        })
    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:err.message
        })
    }
}


//get all tags handler 
exports.showAllTags=async(req,res)=>{
    try{
        const allTags=await Tags.find({},{name:true,description:true})// iska matlab ye hota h ki sare data show karo par make sure karna ki jo bhi data hoga osme name,description compulsarily ho.

        res.status(200).json({
            success:true,
            message:"All Tags returned Successfullt",allTags
        })
    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:err.message
        })
    }
}