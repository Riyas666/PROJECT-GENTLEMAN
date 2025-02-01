const User = require("../../models/userSchema");
const Category = require("../../models/categorySchema");
const Address = require("../../models/addressSchema")
const Products = require("../../models/productSchema");
const Brand = require("../../models/brandSchema");
const Order = require("../../models/orderSchema");
const bcrypt = require("bcrypt");

const profilePage = async(req,res)=>{
    try{
        const userId = req.session.user;
        const userData = await User.findById(userId)
        const addressData = await Address.findOne({userId: userId});
        console.log("this is the userData", userData)
        res.render("userprofile", {
            user:userData,
            userAddress:addressData
        })
    }catch(error){
        console.error("error for retrieve prodile data", error)
        res.redirect("/pageNotFound")
    }
}
const updateProfile = async (req, res) => {
    try {
        const userId = req.session.user;
console.log("this is user id", userId)
        

const data = req.body;
console.log("this is the date",data)

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { 
                    name: data.name,
                    phone: data.phone,
            },
            { new: true }
        );

        if (!updatedUser) {
            return res.json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: updatedUser
        });

    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile'
        });
    }
};


const getChangePassword = async(req,res) =>{
    try{
        const userId = req.session.user;
        const userData = await User.findById(userId)
        res.render("change-password", {
            user:userData
        })
    }catch(error){
        console.error("error for retrieve password page", error)
        res.redirect("/pageNotFound")
    }
}
  
const changePassword = async(req,res)=>{
    try{

    
    const userId = req.session.user;
    const userData = await User.findById(userId)
    const {currentPassword, newPassword, confirmPassword} = req.body;

    const isMatch = await bcrypt.compare(currentPassword, userData.password);
    if(!isMatch){
        return res.status(404).json({
            success:false,
            message:"Current Password is incorrect"
        })
    }
    if(newPassword!==confirmPassword){
        return res.status(404).json({
            success:false,
            message:"New Passwords do not match"
        })
    }
    if(newPassword.length<8){
        return res.status(404).json({
            success:false,
            message:"Passwords must be atleast 8 Characters"
        })
    }
    const hashedPassword = await bcrypt.hash(newPassword,10)
    userData.password = hashedPassword;
    await userData.save()
    res.status(200).json({
        success:true,
        message:"Passwords Updated Successfully"
    })
}catch(error){
    console.error("Change password error:", error);
  res.status(500).json({
    success: false,
    message: "Failed to change password",
  });
}
}

const getAddressPage = async(req,res)=>{
    try{
        const userId = req.session.user;
        const userData = await User.findById(userId)
        const currentPage = parseInt(req.query.page) || 1;
        const itemsPerPage = 4;
        const skip = (currentPage - 1) * itemsPerPage; 

        const addressData = await Address.findOne({ userId: userId });
        if (!addressData || addressData.address.length === 0) {
            return res.render('address', {
                user: userData,
                userAddress: [],
                currentPage: 1,
                totalPages: 1,
            });
        }
        const totalAddresses = addressData.address.length;
        const totalPages = Math.ceil(totalAddresses / itemsPerPage);

        
        const paginatedAddresses = addressData.address.slice(skip, skip + itemsPerPage);

        
        res.render('address', {
            user: userData,
            userAddress: { address: paginatedAddresses }, 
            currentPage: currentPage,
            totalPages: totalPages
        });



    }catch(error){
        console.error("error for retrieve address page", error)
        res.redirect("/pageNotFound")
    }
}




const addAddress = async(req,res) =>{
   try{

    
    const userId = req.session.user
    const {name, city, state, pincode, landmark, phonenumber, addressType } = req.body;
   
    const userAddress = await Address.findOne({userId:userId})
    if(!userAddress){
        const newAddress = new Address({
            userId: userId,
            address:[{name, city, landmark, state, pincode, phonenumber, addressType}]
        })
        await newAddress.save()
       
    }else{
       
        userAddress.address.push({name, city, landmark, state, pincode, phonenumber, addressType})
        await userAddress.save()
    }
        return res.status(200).json({
            success:true,
            message:"Address added successfully"
        })
   }catch(error){
      console.log("Error when adding the address",error)
    
      res.status(500).json({
        success: false,
        message: "Failed to add password",
      });
   }
}
const editAddress = async (req, res) => {
    try {
        const { addressId, name, city, state, pincode, landmark, phonenumber, addressType } = req.body;
     

        const userId = req.session.user;

        const userAddress = await Address.findOne({ userId });


        if (!userAddress) {
            return res.status(404).json({ success: false, message: "User address not found" });
        }
       
            const addressIndex = userAddress.address.findIndex((addr) => addr._id.toString() === addressId);
            if (addressIndex === -1) {
                return res.status(404).json({ success: false, message: "Address not found" });
            }
               

                userAddress.address[addressIndex] = {
                    ...userAddress.address[addressIndex].toObject(),
                    name,
                    city,
                    state,
                    pincode,
                    landmark,
                    phonenumber,
                    addressType,
                    
                };

                await userAddress.save();
                 return res.status(200).json({ success: true, message: "Address updated successfully" });
        
    } catch (error) {
        console.error("Error updating address:", error);
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: "Failed to update address" });
        }
    }
};


const deleteAddress = async (req, res) => {
    try {
        console.log(req.params)
        const  addressId  = req.params.addressId; 
        const userId = req.session.user; 
        console.log("this is the delete reuqest", addressId, userId)

        const userAddress = await Address.findOne({ userId });

        if (!userAddress) {
            return res.status(404).json({ success: false, message: "User address not found" });
        }

        const addressIndex = userAddress.address.findIndex((addr) => addr._id.toString() === addressId);

        if (addressIndex === -1) {
            return res.status(404).json({ success: false, message: "Address not found" });
        }

        userAddress.address.splice(addressIndex, 1);

        await userAddress.save();

        res.status(200).json({ success: true, message: "Address deleted successfully" });
    } catch (error) {
        console.error("Error deleting address:", error);

        if (!res.headersSent) {
            res.status(500).json({ success: false, message: "Failed to delete address" });
        }
    }
};


const removeProduct = async (req, res) => {
    try {
        const { productId, size } = req.params;
        const userId = req.session.user; 
        console.log("Remove product request:", productId, size, userId);

        const userCart = await Cart.findOne({ userId });

        if (!userCart) {
            return res.status(404).json({ success: false, message: "Cart not found" });
        }

        
        const productIndex = userCart.items.findIndex(
            (item) => item.productId.toString() === productId && item.size === size
        );

        if (productIndex === -1) {
            return res.status(404).json({ success: false, message: "Product not found in the cart" });
        }

        userCart.items.splice(productIndex, 1);

        await userCart.save();

        res.status(200).json({ success: true, message: "Product removed from cart successfully" });
    } catch (error) {
        console.error("Error removing product from cart:", error);

        
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: "Failed to remove product from cart" });
        }
    }
};



const getOrders = async (req, res) => {
    try {
      const userId = req.session.user;  
      const order = await Order.find({ userId })
      .populate({
        path: 'orderedItems.products',
        model: 'Product' 
      }).exec()
      console.log(JSON.stringify(order[0].orderedItems, null, 2))
  
      if (order.length === 0) {
        return res.status(404).render("orders", {
          success: false,
          message: "No orders found.",
          order
        });
      }
      const orders = order.reverse()
      res.render("orders", {
        success: true,
        orders,  
      });
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).render("orders", {
        success: false,
        message: "An error occurred while fetching orders.",
      });
    }
  };
  




  const wallet = async(req,res)=>{
    const userId = req.session.user;
    try{
        const user = await User.findById(userId)
res.render("wallet", {user})
    }catch(error){
console.error(error)
    }
  }

module.exports = {
    profilePage,
    updateProfile,
    getChangePassword,
    changePassword,
    getAddressPage,
    addAddress,
    editAddress,
    deleteAddress,
    removeProduct,
    getOrders,
   wallet
}