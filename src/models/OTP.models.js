import mailSender from '../utils/mailSender';

const mongoose = require('mongoose');

const OTPSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
        },
        otp: {
            type: String,
            required: true,
        },
        createdAt: {
            type: Date,
            default: Date.now(),
            expires: 5*60,
        }
    }
);



// a func -> to send email
async function sendVerificationEmail(email, otp) {
    try{
        const mailResponse = await mailSender(email, "Verification Email from EduLearn", otp);
        console.log("Email sent successfully: ", mailResponse);
    } catch (error) {
        console.log("error occured while sending mails ", error);
        throw error;
    }
}

// pre middleware for sending mail before the doc save in DB
OTPSchema.pre("save", async function(next) {
    await sendVerificationEmail(this.email, this.otp);
    next();
})



export const OTP = mongoose.model("OTP", OTPSchema);