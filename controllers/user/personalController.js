const User = require("../../models/userSchema");
const Category = require("../../models/categorySchema");
const Address = require("../../models/addressSchema")
const Products = require("../../models/productSchema");
const Brand = require("../../models/brandSchema");
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
console.log("thi is user id", userId)
        

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
const getCart = async(req,res)=>{
    try{
        res.render("cart")
    }catch(error){

    }
}

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
        const itemsPerPage = 4; // Set how many addresses you want to show per page
        const skip = (currentPage - 1) * itemsPerPage; 

        const addressData = await Address.findOne({ userId: userId });
        if (!addressData || addressData.address.length === 0) {
            // If no addresses exist, render with empty data
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
        if (userAddress) {
            const addressIndex = userAddress.address.findIndex((addr) => addr._id.toString() === addressId);
            if (addressIndex !== -1) {
                if (isPrimaryAddress) {
                    // Unmark other addresses
                    userAddress.address.forEach((addr) => (addr.isPrimary = false));
                }

                // Update address fields
                userAddress.address[addressIndex] = {
                    ...userAddress.address[addressIndex]._doc,
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
            }
        }

        res.status(404).json({ success: false, message: "Address not found" });
    } catch (error) {
        console.error("Error updating address:", error);
        res.status(500).json({ success: false, message: "Failed to update address" });
    }
};









module.exports = {
    profilePage,
    getCart,
    updateProfile,
    getChangePassword,
    changePassword,
    getAddressPage,
    addAddress,
    editAddress
}