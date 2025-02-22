const User = require("../../models/userSchema");
const Product = require("../../models/productSchema")





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
        return res.status(400).json({ status: false, message: "Product ID is required" });
      }
  
      const user = await User.findById(userId) 
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ status: false, message: "Product not found" });
      }
  
  
    let selectedSize;
      if (size) {
        selectedSize = size;
      } else {
        selectedSize = product.sizes.length > 0 ? product.sizes[0].size : null;
      }
  
  
      if (!selectedSize) {
        return res.status(400).json({ status: false, message: "No valid size available for this product" });
      }
  
      if (user.wishlist?.some((item) => item.productId?.toString() === productId &&item.size===selectedSize)) {
        return res.status(200).json({ status: false, message: "Product already in wishlist" });
      }

      const sizeObject = product.sizes.find((item) => item.size === selectedSize);
      if (!sizeObject) {
        return res.status(400).json({ status: false, message: "Invalid size selected" });
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
      res.status(200).json({ 
        status: true, 
        message: "Product added to wishlist"
     });
  
    }catch(error){
      console.error(error);
      res.status(500).json({ 
        status: false, 
        message: "Internal server error"
     });
    }
  }


  
const deleteWishlistItem = async (req, res) => {
    try {
      const { productId } = req.body; 
      const userId = req.session.user;
  
      if (!productId) {
        return res.status(400).json({ success: false, message: "Product ID is required" });
      }
  
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $pull: { wishlist: { productId } } }, 
        { new: true } 
      ).populate("wishlist.productId"); 
  
      if (!updatedUser) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
  
      res.status(200).json({
        success: true,
        message: "Item removed from wishlist successfully",
        wishlist: updatedUser.wishlist, 
      });
    } catch (error) {
      console.error("Error deleting wishlist item:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  };
  

  
  module.exports = {
    getWishlist,
    addToWishlist,
    deleteWishlistItem,
  }