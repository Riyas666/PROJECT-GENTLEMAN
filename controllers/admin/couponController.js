const Coupon = require("../../models/couponSchema")
const mongoose = require("mongoose")
const statuscode = require("../../constants/statusCodes");
const responseMessage = require("../../constants/responseMessage");


const getCoupon = async(req,res) =>{
  try{
    const findCoupons = await Coupon.find({})
    return res.render("coupon", {coupons:findCoupons})
  }catch(error){
return res.redirect("/pageerror")
  }
}
const createCoupon = async (req, res) => {
    try {
        const { couponName, startDate, endDate, offerPrice, minimumPrice } = req.body;

        const existingCoupon = await Coupon.findOne({ name: couponName });
        if (existingCoupon) {
            return res.status(statuscode.CONFLICT).json({ 
                success: false, 
                message: responseMessage.COUPON_EXIST
            });
        }

        const newCoupon = new Coupon({
            name: couponName,
            createdOn: new Date(startDate + "T00:00:00"),
            expireOn: new Date(endDate + "T00:00:00"),
            offerPrice: parseInt(offerPrice),
            minimumPrice: parseInt(minimumPrice),
        });

        await newCoupon.save();

        return res.status(statuscode.CREATED).json({ 
            success: true, 
            message: responseMessage.COUPON_ADDED });

    } catch (error) {
        console.error("Error in createCoupon:", error);
        return res.status(statuscode.INTERNAL_SERVER_ERROR).json({ 
            success: false, 
            message: responseMessage.SERVER_ERROR });
    }
};


const  editCoupon = async(req,res)=>{
    try{
        const id = req.query.id;
        const findCoupon = await Coupon.findOne({_id:id});
        res.render("edit-coupon", {
            findCoupon
        });
    }catch(error){
        res.redirect("/pageerror")
    };
};

const updateCoupon = async(req,res)=>{
    try{
        const {couponId, couponName, startDate, endDate, offerPrice, minimumPrice} = req.body;

        const updatedCoupon = await Coupon.updateOne(
                {_id:couponId},
                {
                    $set:{
                        name:couponName,
                        createdOn:new Date(startDate),
                        expireOn: new Date(endDate),
                        offerPrice:parseInt(offerPrice),
                        minimumPrice:parseInt(minimumPrice)
                    },
                }, 
            );
            if(updatedCoupon){
                return res.status(statuscode.OK).json({
                    success:true,
                    message:responseMessage.COUPON_UPDATED
                })
            }
        }catch(error){
                console.log("error",error)
                res.status(statuscode.INTERNAL_SERVER_ERROR).json({
                    success:false,
                    message:responseMessage.SERVER_ERROR
                })
            }
    };


const deleteCoupon = async(req,res)=>{
    try{
        const id = req.query.id;
        const result = await Coupon.deleteOne({_id:id});
        if (result.deletedCount > 0) {
            return res.status(statuscode.OK).json({
                success: true,
                message: responseMessage.COUPON_DELETED
            });
        } else {
            return res.status(statuscode.NOT_FOUND).json({
                success: false,
                message: responseMessage.COUPON_NOT_FOUND
            });
        }
    }catch(error){
        console.error("Error deleting coupon:", error);
        res.status(statuscode.INTERNAL_SERVER_ERROR).json({ 
            success:false, 
            message:responseMessage.SERVER_ERROR
        })
    }
};

       

module.exports = {
    getCoupon,
    createCoupon,
    editCoupon,
    updateCoupon,
    deleteCoupon
}