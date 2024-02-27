const Tag = require("../models/Tags.models")

//create handler function of Tag
//CREATE TAG
exports.createTag = async (req, res) => {
    try {
        //fetch data (name, description)
        const {name, description} = req.body;
        //validating the data
        if(!name || !description) {
            return res.status(400).json({
                success: false,
                message: "All fields are required to fill",
            })
        }
        //create entry in db
        const tagDetails = await Tag.create({
            name: name,
            description: description,
        });
        console.log("Tag Details-:", tagDetails);

        //return response
        return res.status(200).json({
            success: true,
            message: "Tag created Successfully",
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error occured while creating tag"
        })
    }
}


//getAllTags Handler Function
exports.showAllTags = async (req, res) => {
    try {
        const allTags = await Tag.find({}, {name: true, description: true});
        return res.status(200).json({
            success: true,
            message: "All tags returned successfully",
            allTags,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong while getting all tags"
        })
    }
}