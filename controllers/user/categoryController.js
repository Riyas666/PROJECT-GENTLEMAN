const Category = require("../../models/categorySchema");


const getCategories = async (req, res) => {
    try {
        const categories = await Category.find({isListed:true})
        console.log("categoriesssssssss the thing is that i want to know ", categories)
        res.json(categories);
    } catch (error) {
        console.log("Error fetching Category", error);
        res.status(500).json({ error: "Failed to fetch Category" });
    }
}

module.exports = {
    getCategories
}