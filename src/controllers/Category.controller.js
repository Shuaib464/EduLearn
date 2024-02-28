const Category = require("../models/Category.models")

//createCategory handler function 
//CREATE category
exports.createCategory = async (req, res) => {
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
        const categoryDetails = await Category.create({
            name: name,
            description: description,
        });
        console.log("Category Details-:", categoryDetails);

        //return response
        return res.status(200).json({
            success: true,
            message: "Category created Successfully",
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error occured while creating category"
        })
    }
}


//getAllCategories Handler Function
exports.showAllCategories = async (req, res) => {
    try {
        const allCategories = await Category.find({}, {name: true, description: true});
        return res.status(200).json({
            success: true,
            message: "All categories returned successfully",
            allCategories,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong while getting all categories"
        })
    }
}