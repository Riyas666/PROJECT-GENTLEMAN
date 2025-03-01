const Category = require("../../models/categorySchema");
const statuscode = require("../../constants/statusCodes");
const responseMessage = require("../../constants/responseMessage");


const categoryInfo = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 4;
        const skip = (page - 1) * limit;

        const searchQuery = req.query.search ? req.query.search.trim() : "";
        
        let filter = {};
        if (searchQuery) {
            filter = { name: { $regex: searchQuery, $options: "i" } }; 
        }

        const categoryData = await Category.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalCategories = await Category.countDocuments(filter);
        const totalPages = Math.ceil(totalCategories / limit);

        res.render("category", {
            cat: categoryData,
            currentPage: page,
            totalPages,
            totalCategories,
            searchQuery, 
        });

    } catch (error) {
        console.error(error);
        res.redirect("/pageerror");
    };
};

const addCategory = async (req, res) => {

    const { name, description } = req.body;
    const trimmedName = name.trim();
    console.log("aa", trimmedName)
    console.log("bb", description)

    try {
        const existingCategory = await Category.findOne({ name: trimmedName });
        if (existingCategory) {
            return res.status(statuscode.BAD_REQUEST).json({ 
                success:false,
                message:responseMessage.CATEGORY_EXIST
                });
        };
       
        const newCategory =  new Category({
           name: trimmedName,
           description: description,
        });
        console.log("bb" , newCategory) 

        await newCategory.save();
        console.log("cc")

        return res.status(statuscode.CREATED).json({ 
            success: true,
            message: responseMessage.CATEGORY_ADDED,
            
         });

    } catch (error) {
        console.error("Error adding category", error);
        return res.status(statuscode.INTERNAL_SERVER_ERROR).json({ error: responseMessage.SERVER_ERROR });
    };
};


const listCategory = async(req, res) =>{
    const {id}= req.body;
try{
    await Category.updateOne({_id: id}, {$set:{isListed:true}});
    return res.status(statuscode.OK).json({
        success:true,
        message:responseMessage.CATEGORY_LISTED
    })
}catch(error){
    console.error("Error listing the category", error);
    return res.status(statuscode.INTERNAL_SERVER_ERROR).json({
        success:false,
        message:responseMessage.SERVER_ERROR
    })
  }
}


const unlistCategory = async(req, res) =>{
    const {id}= req.body;
try{
    await Category.updateOne({_id: id}, {$set:{isListed:false}});
    return res.status(statuscode.OK).json({
        success:true,
        message:responseMessage.CATEGORY_UNLISTED
    })
}catch(error){
    console.error("Error unlisting the category", error);
    return res.status(statuscode.INTERNAL_SERVER_ERROR).json({
        success:false,
        message:responseMessage.SERVER_ERROR
    })
  }
}



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
            return res.status(statuscode.BAD_REQUEST).json({
                success: false,
                message: responseMessage.CATEGORY_EXIST,
                 });
        }

        category.name = trimmedName; 
        category.description = description;

        await category.save();

        return res.status(statuscode.CREATED).json({ 
            success: true, 
            message: responseMessage.CATEGORY_UPDATED 
        });
    } catch (error) {
        console.error(error);
        return res.status(statuscode.INTERNAL_SERVER_ERROR).json({ 
            success: false,
            message: responseMessage.SERVER_ERROR 
        });
    };
};
module.exports = {
    categoryInfo,
    addCategory,
    getEditCategory,
    editCategory,
    listCategory,
    unlistCategory
};