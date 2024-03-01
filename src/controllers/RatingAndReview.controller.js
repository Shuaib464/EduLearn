const RatingAndReview = require("../models/RatingAndReview.models");
const Course = require("../models/Course.models");
const { default: mongoose } = require("mongoose");

//createRating 
exports.createRating = async (req, res) => {
    try {
        //get user Id
        const userId = req.user.id;
        //get data from req.body
        const {rating, review, courseId} = req.body;
        //check whether user is enrolled or not
        const courseDetails = await Course.findById(
                                        {_id: courseId,
                                        studentsEnrolled: { $elemMatch: {$eq: userId} },
                                        },
        )

        if(!courseDetails) {
            return res.status(404).json({
                success: false,
                message: "Student is not enrolled in the course"
            });
        }
        //check whether user already reviewed this course
        const alreadyReviewed = await RatingAndReview.findOne({
                                                user: userId,
                                                course: courseId,
        })

        if(alreadyReviewed) {
            return res.status(403).json({
                success: false,
                message: "Course is already reviewed"
            })
        }
        //create rating and review
        const ratingAndReview = await RatingAndReview.create({
                                                rating, review,
                                                user: userId,
                                                course: courseId,
                                                });

        //update course with this rating
        const updatedCourse = await Course.findByIdAndUpdate({_id: courseId},
                                    {
                                        $push: {
                                            ratingAndReview: ratingAndReview._id,
                                        }
                                    },
                                    {new: true});
        console.log(updatedCourse);
        //return response
        return res.status(200).json({
            success: true,
            message: "Rating and Review is created",
            ratingAndReview,
        })
    } catch (error) {
        console.log("error while creating Rating and Review");
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}


//getAverageRating handler function
exports.getAverageRating = async (req, res) => {
    try {
        //get course id 
        const courseId = req.body.courseId;

        //calculate avg rating
        const result = await RatingAndReview.aggregate([
            {
                $match: {
                    course: new mongoose.Types.ObjectId(courseId),
                },
            },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: "$rating" },
                }
            }
        ])

        //return rating
        if(result.length > 0) {
            return res.status(200).json({
                success: true,
                averageRating: result[0].averageRating,
            })
        }

        //if no rating/Review exist
        return res.status(200).json({
            success: true,
            message: 'Average rating is 0, no rating given till now',
            averageRating: 0,
        })


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

//getAllRatingAndReview
exports.getAllRating = async (req, res) => {
    try {
        const allReviews = await RatingAndReview.find({})
                                    .sort( {rating: "desc"} )
                                    .populate({
                                        path: "user",
                                        select: "firstName lastName email image",
                                    })
                                    .populate({
                                        path: "course",
                                        select: "courseName",
                                    })
                                    .exec();
        
        return res.status(200).json({
            success: true,
            message:"All reviews fetched successfully",
            data: allReviews,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}