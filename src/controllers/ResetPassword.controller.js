const User = require("../models/User.models");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");

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
        console.log("Details : ",updatedDetails);
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
exports.resetPassword = async (req, res) => {
    try {
        //data fetch
        const {password, confirmPassword, token} = req.body;
        //validation
        if(password !== confirmPassword) {
            return res.json({
                success: false,
                message: "Password does not match, please try again",
            })
        }
        //get userDetails from DB using token
        const userDetails = await User.findOne({token: token});
        //if no entry - invalid token
        if(!userDetails) {
            return res.json({
                success: false,
                message: "Token is Invalid",
            })
        }
        //token time check
        if(userDetails.resetPasswordToken < Date.now()) {
            return res.json({
                success: false,
                message: "Token is expired, please regenerate your token",
            })
        }
        //hash pwd
        const hashPassword = await bcrypt.hash(password, 10);
        //password update 
        await User.findOneAndUpdate(
            {token: token},
            {password: hashPassword},
            {new: true},
        )
        //return response
        return res.status(200).json({
            success: true,
            message: "Password reset Successful",
        })
    } catch (error) {

    }
}