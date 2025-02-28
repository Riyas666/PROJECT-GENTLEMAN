const Brand = require("../../models/brandSchema");
const statuscode = require("../../constants/statusCodes");
const responseMessage = require("../../constants/responseMessage");

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
        
        res.render("brands", {
            limit,
            data:brandData,
            currentPage:page,
            totalPages,
            totalBrands
        });

        }catch(error){
            console.log("Error fetching brands",error);
            res.redirect("/pageerror")
    };
};


const addBrand = async(req,res) =>{

    const brand = req.body.name.trim();
    const image = req.file.filename;
    try{
        const existingBrand = await Brand.findOne({brand:brand})  
        if(existingBrand){
            return res.status(statuscode.BAD_REQUEST).json({
                success:false,
                message:responseMessage.BRAND_EXIST,
                })
        }
            const newBrand = new Brand({
                brandName :brand,
                brandImage: image,
            });
            await newBrand.save();
            return res.status(statuscode.CREATED).json({
                success: true,
                message: responseMessage.BRAND_ADDED, 
                brand: newBrand,
            });
           
    }catch(error){
        console.error("Error adding brand",error);
        return res.status(statuscode.INTERNAL_SERVER_ERROR).json({
            success:false,
            message:responseMessage.SERVER_ERROR
        })
    };
};

const blockBrand = async (req, res) => {

    const { id } = req.body;
    
    try {
        const brand = await Brand.findById(id);
        if(!brand){
            return res.status(statuscode.NOT_FOUND).json({
                success:false,
                message:responseMessage.BRAND_NOT_FOUND
            })
        }

        await Brand.updateOne({ _id: id }, { $set: { isBlocked: true } });

        res.status(statuscode.OK).json({ 
            success: true ,
            message: responseMessage.BRAND_BLOCKED_SUCCESS
        });
    } catch (error) {
        res.status(statuscode.INTERNAL_SERVER_ERROR).json({ 
            success: false, 
            error: responseMessage.SERVER_ERROR });
    };
};


const unblockBrand = async (req, res) => {
    const { id } = req.body;
    try {
        const brand = await Brand.findById(id);
        if(!brand){
            return res.status(statuscode.NOT_FOUND).json({
                success:false,
                message:responseMessage.BRAND_NOT_FOUND
            })
        }

        await Brand.updateOne({ _id: id }, { $set: { isBlocked: false } });

        res.status(statuscode.OK).json({ 
            success: true ,
            message: responseMessage.BRAND_UNBLOCKED_SUCCESS
        });
    } catch (error) {
        res.status(statuscode.INTERNAL_SERVER_ERROR).json({ 
            success: false, 
            error: responseMessage.SERVER_ERROR 
        });
    }
};

module.exports = {
    addBrand,
    getBrandPage,
    blockBrand,
    unblockBrand,
}