const express=require("express")
const router=express.Router()

//todo: IMPORTING THE CONTROLLERS
 
//Import Course controller
const {
    createCourse,
    getAllCourses,
    getCourseDetails,
    getFullCourseDetails,
    editCourse,
    getInstructorCourses,
    deleteCourse
}=require("../controllers/Course")

//import Category controller
const {
    createCategory,
    showAllCategories,
    categoryPageDetails
}=require("../controllers/Category")

//import Section Controller
const {
    createSection,
    updateSection,
    deleteSection
}=require("../controllers/Section")

//import Subsection controller
const {
    createSubSection,
    updateSubSection,
    deleteSubSection
}=require("../controllers/Subsection")

//importing Rating controller
const {
    createRating,
    getAverageRating,
    getAllRatingAndReviews
}=require("../controllers/RatingAndReview")

//importing middlewares : 
const {
    auth,
    isStudent,
    isInstructor,
    isAdmin
}=require("../middlewares/auth")

const {updateCourseProgress}=require("../controllers/courseProgress")


// ********************************************************************************************************
//                                      Course routes
// ********************************************************************************************************

//! Courses can only be created by Instructors
router.post("/createCourse",auth,isInstructor,createCourse)

//! Add a Section to a Course
router.post("/addSection",auth,isInstructor,createSection)

//!update a section
router.post("/updateSection",auth,isInstructor,updateSection)

//! Delete a Section
router.post("/deleteSection",auth,isInstructor,deleteSection)

//! Edit sub section
router.post("/updateSubSection",auth,isInstructor,updateSubSection)

//! Delete Sub Section
router.post("/deleteSubSection",auth,isInstructor,deleteSubSection)

//! Add a sub section to a section
router.post("/addSubSection",auth,isInstructor,createSubSection)

//! Get all registered Courses
router.get("/getAllCourses",getAllCourses)

//!get details for specific course
router.post("/getCourseDetails",getCourseDetails)


// todo : Get details for specific couurse

//! get details for a specific course
router.post("/getFullCourseDetails",auth,getFullCourseDetails)

//! Edit Course routes
router.post("/editCourse",auth,isInstructor,editCourse)

//! Get all courses under a specific instructor
router.get("/getInstructorCourses",auth,isInstructor,getInstructorCourses)

//! Delete a Course
router.delete("/deleteCourse",deleteCourse)

//todo : update course progress

router.post("/updateCourseProgress",auth,isStudent,updateCourseProgress)


//todo: Category Routes
router.post("/createCategory",auth,isAdmin,createCategory)
router.get("/showAllCategory",showAllCategories)
router.post("/getCategoryPageDetails",categoryPageDetails)


//todo : Rating and Reviews
router.post("/createRating",auth,isStudent,createRating)
router.get("/gerAverageRating",getAverageRating)
router.get("/getReviews",getAllRatingAndReviews)

module.exports=router