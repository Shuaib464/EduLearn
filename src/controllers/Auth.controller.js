const User = require("../models/User.models");
const OTP = require("../models/OTP.models");
const otpGenerator = require("otp-generator");

const bcrypt = require("bcrypt");
const Profile = require("../models/Profile.models")
const jwt = require("jsonwebtoken");
require("dotenv").config();

//send OTP
exports.sendOTP = async (req, res) => {
    try{
        //fetch email from req->body
        const {email} = req.body;

        //check if user already exists
        const checkUserPresent = await User.findOne({email});

        //if user already present then return the response
        if(checkUserPresent) {
            return res.status(401).json({
                success: false,
                message: "User already registered",
            })
        }

        //generate OTP
        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });

        //check otp is unique or not
        let result = await OTP.findOne({otp: otp});

        while(result) {
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            })
            result = await OTP.findOne({otp: otp});
        }

        const otpPayload = {email, otp};

        //crate an entry for OTP in DB
        const otpBody = await OTP.create(otpPayload);
        console.log(otpBody);

        //return response successfully
        res.status(200).json({
            success: true,
            message: "OTP Sent Successfully",
            otp,
        })

    }catch (error) {
        console.log("Error while sending the OTP", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

//signUp
exports.signUp = async (req, res) => {

    try{
        //fetch the data from the form
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp,
        } = req.body;

        //validate the data
        if(!firstName || !lastName || !email || !password || !confirmPassword || !otp) {
            return res.status(403).json({
                success: false,
                message: "All fields are required",
            })
        }
        //match both pass (pass & confirm pass)
        if(password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Password and ConfirmPassword value does not match, Please try again",
            });
        }
        //check user already exist or not 
        const existingUser = await User.findOne({email});
        if(existingUser) {
            return res.status(400).json({
                success: false,
                message: "User is already registered",
            });
        }

        //find most recent OTP stored in DB for the user
        const recentOtp = await OTP.find({email}).sort({createdAt:-1}).limit(1);
        console.log(recentOtp);
        //validate the OTP
        if(recentOtp.length == 0) {
            return res.status(400).json({
                success: false,
                message: "OTP not found",
            })
        } else if(otp !== recentOtp.otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP",
            })
        }


        //Hash password
        const hashPassword = await bcrypt.hash(password, 10);

        //Create an entry in DB
        //first create entry of additional details in db
        const profileDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: null,
        });

        const user = await User.create({
            firstName,
            lastName, 
            email,
            contactNumber,
            password: hashPassword,
            accountType,
            additionalDetails: profileDetails,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        })

        //return response
        return res.status(200).json({
            success: true,
            message: "User is registered Successfully",
            user,
        })
    } catch (error) {
        console.log("Error occurred while registering the User", error);
        return res.status(500).json({
            success: false,
            message: "User cannot be registered. Please try again"
        })
    }
}

//LOGIN

exports.login = async (req, res) => {
    try {
        // get data from req-> body
        const {email, password} = req.body;

        // validate data
        if(!email || !password) {
            return res.status(403).json({
                success: false,
                message: "All fields are mandatory, Please try again"
            });
        }

        // user exists or not
        const user = await User.findOne({email}).populate("additionalDetails");
        if(!user) {
            return res.status(401).json({
                success: false,
                message: "User is not registered, please signup first",
            })
        }

        // generate JWT token , after pass matching
        if(await bcrypt.compare(password, user.password)) {
            const payload = {
                email: user.email,
                id: user._id,
                role: user.role,
            }
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: "2h",
            });
            user.token = token;
            user.password = undefined;

            // create cookie and send response
            const options = {
                expires: new Date(Date.now() + 3*24*60*60*1000),
                httpOnly: true,
            }
            res.cookie("token", token, options).status(200).json({
                success: true,
                token,
                user,
                message: "Logged in successfully",
            })
        }
        else {
            return res.status(401).json({
                success: false,
                message: "Password is incorrect",
            })
        }
        
    } catch (error) {
        console.log("Error occured while logging in", error);
        return res.status(500).json({
            success: false,
            message: "Login failure, please try again",
        });
    }
}


// changePassword