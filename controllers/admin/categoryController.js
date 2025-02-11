const Product = require("../../models/productSchema");


const categoryInfo = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 4;
        const skip = (page - 1) * limit;

        const categoryData = await Category.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit);

        const totalCategories = await Category.countDocuments();
        const totalPages = Math.ceil(totalCategories / limit);

        res.render("category", {
            cat: categoryData,
            currentPage: page,
            totalPages: totalPages,
            totalCategories: totalCategories,
        });
    } catch (error) {
        console.error(error);
        res.redirect("/pageerror");
    }
};


//FOR ADD THE CATEGORY
const addCategory = async (req, res) => {
    const { name, description } = req.body;
    const trimmedName = name.trim();
    try {

        const existingCategory = await Category.findOne({ name: trimmedName });
        if (existingCategory) {

            return res.status(400).json({ error: "Category already exist" });
        }
        const newCategory = new Category({
           name: trimmedName,
            description,
        });
        await newCategory.save();
        return res.json({ message: "Category added Successfully" });
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error" });
    };
};


//FOR LIST THE CATEGORY
const getListCategory = async (req, res) => {
    try {
        let id = req.query.id;
        await Category.updateOne({ _id: id }, { $set: { isListed: false } });
        res.redirect("/admin/category");
    } catch (error) {
        res.redirect("/pageerror");
    }
};


//FOR UNLIST THE CATEGORY
const getUnListCategory = async (req, res) => {
    try {
        let id = req.query.id;
        await Category.updateOne({ _id: id }, { $set: { isListed: true } });
        res.redirect("/admin/category");
    } catch (error) {
        res.redirect("/pageerror");
    }
};


//FOR GETTING THE EDIT CATEGORY PAGE
const getEditCategory = async (req, res) => {
    try {
        const id = req.params.id;
        const category = await Category.findById(id);
        
        if (!category) {
            throw new Error("Category not found");
        }
        res.render("edit-category", { category });
    } catch (error) {
        res.redirect("/pageerror");
    }
};


//FOR EDIT THE EXISTING CATEGORY
const editCategory = async (req, res) => {
    try {
        const id = req.params.id;
        const { categoryname, description } = req.body;
        const trimmedName = categoryname.trim();
        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({ error: "Category not found" });
        }
        const existingCategory = await Category.findOne({
            name: trimmedName,
            _id: { $ne: id },
        });

        if (existingCategory) {
            return res.status(400).json({ error: "Category already exists, please choose another name" });
        }

        category.name = trimmedName; 
        category.description = description;

        await category.save();

        return res.json({ success:true, message: "Category updated successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
//EXPORTING..
module.exports = {
    categoryInfo,
    addCategory,
    getListCategory,
    getUnListCategory,
    getEditCategory,
    editCategory,
};