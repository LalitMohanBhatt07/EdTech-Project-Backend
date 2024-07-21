const express=require("express")
const router=express.Router()

//todo: IMPORTING THE CONTROLLERS
 
//Import Course controller
const {
    createCourse,
    getAllCourses,
    getCourseDetails
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

const {updatedCourseProgress}=require("../controllers/courseProgress")


// ********************************************************************************************************
//                                      Course routes
// ********************************************************************************************************

//! Courses can only be created by Instructors
router.post("/createCourse",auth,isInstructor,createCourse)
