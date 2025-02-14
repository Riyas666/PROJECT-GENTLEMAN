const Brand = require("../../models/brandSchema");


const getBrandPage = async(req,res) =>{
    try{
        
        const page = parseInt(req.query.page) || 1;
        const limit = 4;
        const skip = (page-1)*limit;
        const brandData = await Brand.find({})
        .sort({createdAt:-1})
        .skip(skip)
        .limit(limit)
        
        const totalBrands = await Brand.countDocuments();
        const totalPages = Math.ceil(totalBrands/limit);
        const reverseBrand = brandData.reverse();
        
        res.render("brands", {
            limit,
            data:reverseBrand,
            currentPage:page,
            totalPages,
            totalBrands
        });

        }catch(error){
            res.redirect("/pageerror")
    };
};


const addBrand = async(req,res) =>{

    const brand = req.body.name;
    const image = req.file.filename;
    const trimmedBrand = brand.trim()
    try{
       
        const existingBrand = await Brand.findOne({brand:trimmedBrand})  

        if(existingBrand){
            return res.status(400).json({error:"Brand already exist"})
        }
       
            const newBrand = new Brand({
                brandName :trimmedBrand,
                brandImage: image,
            });

            await newBrand.save();
            res.redirect("/admin/brands");
        
    }catch(error){
        res.redirect("/pageerror");
    };
};

const blockBrand = async (req, res) => {

    const { id, isBlocked } = req.body;

    try {

        await Brand.updateOne({ _id: id }, { $set: { isBlocked } });
        res.status(200).json({ success: true });
       
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to block Brand." });
    };
};


const unblockBrand = async (req, res) => {
    try {
        const { id, isBlocked } = req.body;
        await Brand.updateOne({ _id: id }, { $set: { isBlocked } });

        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to unblock product." });
    }
};

module.exports = {
    addBrand,
    getBrandPage,
    blockBrand,
    unblockBrand,
}