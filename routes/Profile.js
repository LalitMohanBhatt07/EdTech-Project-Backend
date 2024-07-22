const express=require("express")
const router=express.Router()

const {
    deleteAccount,
    updateProfile,
    getAllUserDetail,
    getEnrolledCourses,
    updateDisplayPicture
} =require("../controllers/Profile")

router.delete("/deleteProfile",deleteAccount)
router.put("/updateProfile",auth,updateProfile)
router.get("/getUserDetails",auth,getAllUserDetail)
router.get("/getEnrolledCourses",auth,getEnrolledCourses)
router.put("/updateDisplayPicture",auth,updateDisplayPicture)