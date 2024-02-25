const User = require("../models/User.models");
const OTP = require("../models/OTP.models");
const otpGenerator = require("otp-generator");

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


//Login


// changePassword