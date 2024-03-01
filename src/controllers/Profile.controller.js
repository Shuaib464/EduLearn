const Profile = require("../models/Profile.models");
const User = require("../models/Profile.models");

//updateProfile handler function
exports.updateProfile = async (req, res) => {
    try {
        //fetch data
        const {dateOfBirth="", about="", contactNumber, gender} = req.body;
        //get userId
        const id = req.user.id;
        //validation
        if(!contactNumber || !gender || !id) {
            return res.status(400).json({
                success: false,
                message: "All fields are mandatory",
            })
        }
        //find profile
        const userDetails = await User.findById(id);
        const profileId = userDetails._id;
        const profileDetails = await Profile.findById(profileId);
        
        //update profile
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.contactNumber = contactNumber;
        profileDetails.gender = gender;

        await profileDetails.save();
        //return response
        return res.status(200).json({
            success: true,
            message: "Profile details updated successfully",
            profileDetails,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "server error",
            error: error.message,
        })
    }
}

//Explore -> how can we schedule deletion of user      (crone job)
//deleteAccount handler
exports.deleteAccount = async (req, res) => {
    try {
        // get id
        const id = req.user.id;
        //validation
        const userDetails = await User.findById(id);
        if(!userDetails) {
            return res.status(404).json({
                success: false,
                message: "user not found",
            })
        }
        //delete profile
        await Profile.findByIdAndDelete({_id: userDetails._id});

        //TODO: unenroll user from all enrolled courses

        //delete user
        await User.findByIdAndDelete({_id: id});

        //return response
        return res.status(200).json({
            success: true,
            message: "user Deleted successfully"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "User cannot be deleted successfully"
        })
    }
}



//getAllUserDetails handler
exports.getAllUserDetails = async (req, res) => {
    try {
        //get id
        const id = req.user.id;
        //validation and get user details
        const userDetails = await User.find(id).populate("additionalDetails").exec();
        //return response
        return res.status(200).json({
            success: true,
            message: "User data fetched successfully",
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}