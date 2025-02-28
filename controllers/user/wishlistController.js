const User = require("../../models/userSchema");
const Product = require("../../models/productSchema");
const statuscode = require("../../constants/statusCodes");
const responseMessage = require("../../constants/responseMessage");

const getWishlist = async(req,res)=>{
    try{
      const userId = req.session.user;
      const user = await User.findById(userId).populate("wishlist.productId");
      res.render("wishlist", {
        user,
        wishlist:user.wishlist,
      })
      
    }catch(error){
     console.error(error)
     res.redirect("/pageNotFound")
    }                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            
  }


  
const addToWishlist = async(req,res)=>{
    try{
      const {productId,size} = req.body;
      const userId = req.session.user;
                                                 
      if (!productId) {
        return res.status(statuscode.BAD_REQUEST).json({ 
          status: false, 
          message: "Product ID is required" 
        });
      }
  
      const user = await User.findById(userId) 
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(statuscode.NOT_FOUND).json({
           success: false, 
           message: responseMessage.PRODUCT_NOT_FOUND
          });
      }
  
  
    let selectedSize;
      if (size) {
        selectedSize = size;
      } else {
        selectedSize = product.sizes.length > 0 ? product.sizes[0].size : null;
      }
  
  
      if (!selectedSize) {
        return res.status(statuscode.BAD_REQUEST).json({ 
          success: false, 
          message: "No valid size available for this product" });
      }
  
      if (user.wishlist?.some((item) => item.productId?.toString() === productId &&item.size===selectedSize)) {
        return res.status(200).json({
           success: false, 
           message: responseMessage.PRODUCT_ALREADY_WISHLIST 
          });
      }
 
      const sizeObject = product.sizes.find((item) => item.size === selectedSize);
      if (!sizeObject) {
        return res.status(statuscode.BAD_REQUEST).json({
          success: false, 
          message: "Invalid size selected" 
        });
      }
      
      const stockStatus = sizeObject.quantity > 0 ? 'In Stock' : 'Out of Stock';
  
      user.wishlist.push ({
        name:product.productName,
        price:product.salePrice,
        productId, 
        size: selectedSize, 
        stockStatus 
      })

      await user.save()
      res.status(statuscode.OK).json({ 
        status: true,
        message: responseMessage.PRODUCT_ADDED
     });
  
    }catch(error){
      console.error(error);
      res.status(statuscode.INTERNAL_SERVER_ERROR).json({ 
        success: false, 
        message: responseMessage.SERVER_ERROR 
    });
    }
  }


const deleteWishlistItem = async (req, res) => {
    try {
      const { productId } = req.body; 
      const userId = req.session.user;
  
      if (!productId) {
        return res.status(statuscode.BAD_REQUEST).json({ success: false, message: "Product ID is required" });
      }
  
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $pull: { wishlist: { productId } } }, 
        { new: true } 
      ).populate("wishlist.productId"); 
  
      if (!updatedUser) {
        return res.status(statuscode.NOT_FOUND).json({ success: false, message: "User not found" });
      }
  
      res.status(statuscode.OK).json({
        success: true,
        message: responseMessage.PRODUCT_REMOVED_WISHLIST,
        wishlist: updatedUser.wishlist, 
      });
    } catch (error) {
      console.error("Error deleting wishlist item:", error);
      res.status(statuscode.INTERNAL_SERVER_ERROR).json({ 
        success: false, 
        message: responseMessage.SERVER_ERROR 
    });
    }
  };
  

  
  module.exports = {
    
    getWishlist,
    addToWishlist,
    deleteWishlistItem,

  }