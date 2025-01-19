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
        
        res.render("profile", {
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

const addAddress = async(req,res) =>{
   try{
    const userId = req.session.user
    const {name, city, state, pincode, landmark, phonenumber, addressType} = req.body;
    console.log("this is name",name)

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








module.exports = {
    profilePage,
    getCart,
    updateProfile,
    changePassword,
    addAddress
}