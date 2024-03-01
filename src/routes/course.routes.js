//importing the required modules
const express = require("express");
const router = express.Router();

//Import the controllers that is required

//Course Controllers
const {createCourse, getAllCourses, getCourseDetails} = require("../controllers/Course.controller");

//Category controllers 
const {createCategory, showAllCategories, categoryPageDetails} = require("../controllers/Category.controller");

//Section controllers
const {createSection, updateSection, deleteSection} = require("../controllers/Section.controller");

//Sub_Section controllers
const {createSubSection, updateSubSection, deleteSubSection} = require("../controllers/SubSection.controller");

//Rating controllers
const {createRating, getAverageRating, getAllRating} = require("../controllers/RatingAndReview.controller");



// Import the required middlewares
const {auth, isStudent, isInstructor, isAdmin} = require("../middlewares/auth.middleware");





//   ********   ROUTES for Course     **********

// Course creation
router.post("/createCourse", auth, isInstructor, createCourse)
// Add a section to a course
router.post("/addSection", auth, isInstructor, createSection)
// Update a section
router.post("/updateSection", auth, isInstructor, updateSection)
//Delete a section
router.post("/deleteSection", auth, isInstructor, deleteSection)
// Add a SubSection
router.post("/addSubSection", auth, isInstructor, createSubSection)
// update subSection
router.post("/updateSubSection", auth, isInstructor, updateSubSection)
// delete a subSection
router.post("/deleteSubSection", auth, isInstructor, deleteSubSection)

// get All courses (registered)
router.get("/getAllCourses", getAllCourses)
// get detail for a specific courses
router.post("/getCourseDetails", getCourseDetails)



//     ********  Category Routes (admin only)   ********

// category can be created by ADMIN only
router.post("/createCategory", auth, isAdmin, createCategory)
router.post("/showAllCategories", showAllCategories)
router.post("/getCategoryPageDetails", categoryPageDetails)



//     ********  Rating And Review    *********
router.post("/createRating", auth, isStudent, createRating)
router.get("/getAverageRating", getAverageRating)
router.get("/getReviews", getAllRating)


//export the router
module.exports = router;