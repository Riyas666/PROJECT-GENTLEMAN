const Brand = require("../../models/brandSchema")
const Product = require("../../models/productSchema")


const getBrandPage = async(req,res) =>{
    try{
        
        const page = parseInt(req.query.page) || 1;
        // console.log('haiiii')
        const limit = 4
        const skip = (page-1)*limit
        const brandData = await Brand.find({})
        .sort({createdAt:-1})
        .skip(skip)
        .limit(limit)
        
        const totalBrands = await Brand.countDocuments()
        const totalPages = Math.ceil(totalBrands/limit)
 
        const reverseBrand = brandData.reverse()
        
        res.render("brands", {
            data:reverseBrand,
            currentPage:page,
            totalPages:totalPages,
            totalBrands:totalBrands
        })
        }catch(error){
            res.redirect("/pageerror")
    }
}


const addBrand = async(req,res) =>{
    const brand = req.body.name;
    const image = req.file.filename;

    
    const trimmedBrand = brand.trim()
    try{
       
        const existingBrand = await Brand.findOne({brand:trimmedBrand})
        console.log(`brand name is ${trimmedBrand}`)
        
        if(existingBrand){
            return res.status(400).json({error:"Brand already exist"})
        }
       
       
            const newBrand = new Brand({
                brandName :trimmedBrand,
                brandImage: image,
            })

            console.log(`brand details is ${newBrand}`)
            
            await newBrand.save()
            console.log("brand added successfully")
            res.redirect("/admin/brands")
        
    }catch(error){
        console.log("error while saving the brand")
        res.redirect("/pageerror")
    }

}

const blockBrand = async (req, res) => {
    const { id, isBlocked } = req.body;
    try {
        await Brand.updateOne({ _id: id }, { $set: { isBlocked } });

        res.status(200).json({ success: true });
        //res.redirect("/admin/products");
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to block Brand." });
        //res.redirect("/admin/pageerror");
    }
};


const unblockBrand = async (req, res) => {
    try {
        const { id, isBlocked } = req.body;
        await Brand.updateOne({ _id: id }, { $set: { isBlocked } });
        res.status(200).json({ success: true });
        // res.redirect("/admin/products");
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to unblock product." });
        // res.redirect("/admin/pageerror");
    }
};








module.exports = {
    addBrand,
    getBrandPage,
    blockBrand,
    unblockBrand,
}