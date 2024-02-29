const Course = require("../models/Course.models");
const Category = require("../models/Category.models");
const User = require("../models/User.models");
const {uploadImageToCloudinary} = require("../utils/imageUploader");

//createCourse handler function
exports.createCourse = async (req, res) => {
    try{
        //fetch data
        const {courseName, courseDescription, whatYouWillLearn, price, category, tag} = req.body;

        //file fetch(get thumbnail)
        const thumbnail = req.files.thumbnailImage;
        console.log("Cloudnary Image Data-: ", thumbnail);

        //validation
        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !category) {
            return res.status(400).json({
                success: false,
                message: "All fields are mandatory"
            })
        }

        //Instructor validation
        const userId = req.user.id;
        const instructorDetails = await User.findById(userId);
        console.log("user id : ",userId);
        console.log("Instructor Details: ", instructorDetails);

        if(!instructorDetails) {
            return res.status(404).json({
                success: false,
                message: "Instructor Details not found",
            })
        }

        //Category validation (check given category is valid or not)
        const categoryDetails = await Category.findById(category);
        if(!categoryDetails) {
            return res.status(404).json({
                success: false,
                message: "Category details not found",
            })
        }

        //Image upload -> cloudinary
        const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);

        //create course entry in DB
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            whatYouWillLearn: whatYouWillLearn,
            price,
            category:categoryDetails._id,
            tag,
            thumbnail: thumbnailImage.secure_url,
        })

        //add course entry in user schema
        await User.findByIdAndUpdate (
            {_id: instructorDetails._id},
            {
                $push: {
                    courses: newCourse._id,
                }
            },
            {new: true},
        )

        //add course entry in tag schema
        await Category.findByIdAndUpdate (
            {id: categoryDetails._id},
            {
                $push: {
                    course: newCourse._id, 
                }
            },
            {new: true},
        );

        //return response
        return res.status(200).json({
            success: true,
            message: "Course created successfully",
            data: newCourse,
        });
    } catch (error) {
        console.log("Error occured while creating course ",error );
        return res.status(500).json({
            success: false,
            message: "Failed to create course",
            error: error.message,
        })
    }
}



//getAllCourses handler function
exports.showAllCourses = async(req, res) => {
    try{
        const allCourses = await Course.find({}, {courseName: true,
                                                 price: true,
                                                thumbnail: true,
                                                instructor: true,
                                                ratingAndReviews: true,
                                                studentsEnrolled: true,})
                                                .populate("instructor")
                                                .exec();
        return res.status(200).json({
            success: true,
            message: "Data for all couses fetched successfully",
            allCourses,
        })
    } catch (error) {
        console.log("Error occured while fetching all courses data :" ,error);
        return res.status(500).json({
            success: false,
            message: "Cannot fetch course data",
            error: error.message,
        })
    }
}


//getCourseDetails   (retrieve whole course details including instructor, sections, subsections)
exports.getCourseDetails = async (req, res) => {
    try {
        //get id 
        const {courseId} = req.body;
        //find course details
        const courseDetails = await Course.find(
                                    {_id: courseId})
                                    .populate(
                                        {
                                            path: "instructor",
                                            populate: {
                                                path: "additionalDetails",
                                            }
                                        }
                                    )
                                    .populate("category")
                                    .populate(
                                        {
                                            path: "courseContent",
                                            populate: {
                                                path: "subSection",
                                            },
                                        }
                                    )
                                    .exec();
            // validation
            if(!courseDetails) {
                return res.status(400).json({
                    success: false,
                    message: `Could not find the course with ${courseId}`,
                })
            }

            //return response
            return res.status(200).json({
                success: true,
                message: "Course details fetched successfully",
                courseDetails,
            })
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}