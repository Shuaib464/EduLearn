const {instance} = require("../config/razorpay");
const Course = require("../models/Course.models");
const User = require("../models/User.models");
const mailSender = require("../utils/mailSender");
const {courseEnrollmentEmail} = require("../mail/templates/courseEnrollmentEmail");
const { default: mongoose } = require("mongoose");

//capture payment and initiate the razorpay order
exports.capturePayment = async (req, res) => {
    //get courseId and userId
    const {courseId} = req.body;
    const userId = req.user.id;
    //validation
    //valid courseId
    if(!courseId) {
        return res.json({
            success: false,
            message: "Please provide valid courseId"
        })
    }
    //valid courseDetails
    let course;
    try {
        course = await Course.findById(courseId);
        if(!course) {
            return res.json({
                success: false,
                message: "could not find the course",
            })
        }

        //user already pay for same course ?
        const uid = new mongoose.Types.ObjectId(userId);  //convert stringType(userId) to objectId type(uid)
        if(course.studentsEnrolled.includes(uid)) {
            return res.status(200).json({
                success: false,
                message: "Student is already enrolled"
            })
        }
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            success: false,
            message: error, 
        })
    }

    //order create
    const amount = course.price;
    const currency = "INR";

    const options = {
        amount: amount * 100,
        currency,
        receipt: Math.random(Date.now()).toString(),
        notes: {
            courseId: courseId,
            userId,
        }
    }

    try {
        //initiate the payment using razorpay
        const paymentResponse = await instance.orders.create(options);
        console.log(paymentResponse);

        //return response
        return res.status(200).json({
            success: true,
            courseName: course.courseName,
            courseDescription: course.courseDescription,
            thumbnail: course.thumbnail,
            orderId: paymentResponse.id,
            currency: paymentResponse.currency,
            amount: paymentResponse.amount,
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Could not initiate order"
        })
    }
}


//verify Signature of Razorpay and Server

exports.verifySignature = async (req, res) => {
    const webhookSecret = "123456789";

    const signature = req.headers["x-razorpay-signature"];

    const shasum = crypto.createHmac("sha256", webhookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if(signature === digest) {
        console.log("Payment is Authorized");

        const {courseId, userId} = req.body.payload.payment.entity.notes;

        try {
            //fulfil the action

            //find the course and enroll the student in it
            const enrolledCourse = await Course.findByIdAndUpdate(
                                            {_id: courseId},
                                            {$push: {studentsEnrolled: userId}},
                                            {new: true},
            );

            if(!enrolledCourse) {
                return res.status(500).json({
                    success: false,
                    message: "Course not found",
                })
            }

            console.log(enrolledCourse);

            //find the student and add the course to his enrolled courses
            const enrolledStudent = await User.findByIdAndUpdate(
                                                {_id: userId},
                                                {$push : {courses: courseId}},
                                                {new: true},
            );

            console.log(enrolledStudent);

            //send confirmation mail
            const emailResponse = await mailSender(
                                        enrolledStudent.email,
                                        "Congratulations from EduLearn",
                                        "Congratulations, you have successfully enrolled in our exciting course",
            );

            console.log(emailResponse);

            //return response
            return res.status(200).json({
                success: true,
                message: "Signature verified and Course added",
            })
        } catch(error) {
            console.log(error);
            return res.status(500).json({
                success: false,
                message: error.message,
            })
        }
    } 
    else {
        return res.status(400).json({
            success: false,
            message: "invalid request"
        });
    }
}
