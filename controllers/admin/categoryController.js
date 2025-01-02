const Category = require("../../models/categorySchema")

const categoryInfo = async(req,res) =>{
    try{
        const page = parseInt(req.query.page) || 1 
        const limit = 4
        const skip = (page-1) * limit

        const categoryData = await Category.find({})
        .sort({createdAt: -1})
        .skip(skip)
        .limit(limit)

        const totalCategories = await Category.countDocuments()
        const totalPages = Math.ceil(totalCategories / limit)

        res.render("category", {
            cat:categoryData,
            currentPage:page,
            totalPages: totalPages,
            totalCategories: totalCategories
        })
    }catch(error){
        console.error(error)
        res.redirect("/pageerror")
    }
}



const addCategory = async(req,res) =>{
    const {name, description} = req.body
    try{
        const existingCategory = await Category.findOne({name})
        if(existingCategory){
            return res.status(400).json({error:"Category already exist"})
        }
        const newCategory = new Category({
            name,
            description,
        })
        await newCategory.save()
        return res.json({message:"Category added Successfully"})
    }catch(error){
        return res.status(500).json({error:"Internal Server Error"}) 
    }
}

const getListCategory = async(req,res) =>{
    try{
        let id = req.query.id;
        await Category.updateOne({_id:id}, {$set:{isListed:false}})
        res.redirect("/admin/category")
    }catch(error){
        res.redirect("/pageerror")
    }
}


const getUnListCategory = async(req,res) =>{
    try{
        let id = req.query.id;
        await Category.updateOne({_id:id}, {$set:{isListed:true}})
        res.redirect("/admin/category")
    }catch(error){
        res.redirect("/pageerror")
    }
}

const getEditCategory = async(req,res) =>{
    try{
        const id = req.query.id;
        const category = await Category.findById(id)
        await Category.updateOne({_id:id})
        res.render("edit-category", {category})
    }catch(error){
        res.redirect("/pageerror")
    }
}


const editCategory = async(req,res)=> {
try{
    const id = req.params.id;
    const {categoryname, description} = req.body;
    const category = await Category.findById(id)
    if (!category) {
        return res.status(404).render("edit-category", { 
            category: {}, 
            error: "Category not found" 
        });
    }
const existingCategory = await Category.findOne({
    name:categoryname,
    _id:{$ne:id},
}) 

if(existingCategory){
    return res.status(400).render("edit-category",{
        category,
        error:"Category exists, please choose another name"
    })
}

category.name = categoryname;
category.description = description;

await category.save();

// Redirect back to the category list
res.redirect("/admin/category");
} catch (error) {
console.error(error);
res.status(500).render("edit-category", { 
    category: {}, 
    error: "Internal server error" 
});
}
};











module.exports = {
    categoryInfo,
    addCategory,
    getListCategory,
    getUnListCategory,
    getEditCategory,
    editCategory
}