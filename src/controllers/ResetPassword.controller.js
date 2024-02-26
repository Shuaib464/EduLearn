const User = require("../models/User.models");
const mailSender = require("../utils/mailSender");


//resetPasswordToken
exports.resetPasswordToken = async (req, res) => {
    try {
        //get email from req-> body
        const email = req.body.email;
        //check user for this email, email validation
        const user = await User.findOne({email: email});
        if(!user) {
            return res.status(401).json({
                success: false,
                message: "Your email is not registered with us",
            })
        }
        //generate token
        const token = crypto.randomUUID();
        //update user by adding token and expiration time
        const updatedDetails = await User.findOneAndUpdate(
                                            {email: email},
                                            {
                                                token: token,
                                                resetPasswordToken: Date.now() + 5*60*1000,
                                            },
                                            {new: true});
        //create url
        const url = `http://localhost:3000/update-password/${token}`;
        // send mail containing the url
        await mailSender(email,
                        "Password Reset Link",
                        `Password reset link: ${url}`);
        //return response
        return res.status(400).json({
            success: true,
            message: "Email sent successfully, please check email and change your password",
        })
    } catch (error) {
        console.log("Error occured while resetting the password", error);
        res.status(500).json({
            success: false,
            message: "something went wrong while resetting password",
        })
    }

}

//resetPassword