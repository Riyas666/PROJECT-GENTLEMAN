

const User = require("../../models/userSchema");
const Address = require("../../models/addressSchema")
const Order = require("../../models/orderSchema");
const bcrypt = require("bcrypt");
const statuscode = require("../../constants/statusCodes");
const responseMessage = require("../../constants/responseMessage");



const profilePage = async(req,res)=>{
    try{
        const userId = req.session.user;
        const userData = await User.findById(userId)
        const addressData = await Address.findOne({userId: userId});
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
        const data = req.body;
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
                message: responseMessage.USER_NOT_FOUND
            });
        }

        res.json({
            success: true,
            message: responseMessage.PROFILE_UPDATE_SUCCESS,
            user: updatedUser
        });

    } catch (error) {
        console.error('Profile update error:', error);
        res.status(statuscode.INTERNAL_SERVER_ERROR).json({ 
            success: false, 
            message: responseMessage.SERVER_ERROR 
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
        return res.status(statuscode.NOT_FOUND).json({
            success:false,
            message: responseMessage.PASSWORD_INCORRECT
        })
    }
    if(newPassword !== confirmPassword){
        return res.status(statuscode.NOT_FOUND).json({
            success:false,
            message: responseMessage.PASSWORD_MISMATCH
        })
    }
    if(newPassword.length < 8){
        return res.status(statuscode.NOT_FOUND).json({
            success: false,
            message: responseMessage.PASSWORD_TOO_SHORT
        })
    }
    const hashedPassword = await bcrypt.hash(newPassword,10)
    userData.password = hashedPassword;
    await userData.save()
    res.status(statuscode.OK).json({
        success: true,
        message: responseMessage.PASSWORD_UPDATED
    })
}catch(error){
    console.error("Change password error:", error);
    res.status(statuscode.INTERNAL_SERVER_ERROR).json({ 
        success: false, 
        message: responseMessage.SERVER_ERROR 
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
        return res.status(statuscode.OK).json({
            success: true,
            message: responseMessage.ADDRESS_ADDED
        })
   }catch(error){
      console.error("Error when adding the address",error)
    
      res.status(statuscode.INTERNAL_SERVER_ERROR).json({ 
        success: false, 
        message: responseMessage.SERVER_ERROR 
    });
   }
}

const editAddress = async (req, res) => {
    try {
        const { addressId, name, city, state, pincode, landmark, phonenumber, addressType } = req.body;
        const userId = req.session.user;
        const userAddress = await Address.findOne({ userId });

        if (!userAddress) {
            return res.status(statuscode.NOT_FOUND).json({ 
                success: false, 
                message: responseMessage.ADDRESS_NOT_FOUND 
            });
        }
       
            const addressIndex = userAddress.address.findIndex((addr) => addr._id.toString() === addressId);
            if (addressIndex === -1) {
                return res.status(statuscode.NOT_FOUND).json({ 
                    success: false, 
                    message: responseMessage.ADDRESS_NOT_FOUND 
                });
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
                 return res.status(statuscode.OK).json({ 
                    success: true, 
                    message: responseMessage.ADDRESS_UPDATED
                });
        
    } catch (error) {
        console.error("Error updating address:", error);
        if (!res.headersSent) {
            res.status(statuscode.INTERNAL_SERVER_ERROR).json({ 
                success: false, 
                message: responseMessage.SERVER_ERROR 
            });
        }
    }
};


    const deleteAddress = async (req, res) => {
        try {
            console.log(req.params)
            const  addressId  = req.params.addressId; 
            const userId = req.session.user; 
            const userAddress = await Address.findOne({ userId });

            if (!userAddress) {
                return res.status(statuscode.NOT_FOUND).json({ 
                    success: false, 
                    message: responseMessage.ADDRESS_NOT_FOUND 
                });
            }

            const addressIndex = userAddress.address.findIndex((addr) => addr._id.toString() === addressId);

            if (addressIndex === -1) {
                return res.status(statuscode.NOT_FOUND).json({ 
                    success: false, 
                    message: responseMessage.ADDRESS_NOT_FOUND
                });
            }

            userAddress.address.splice(addressIndex, 1);

            await userAddress.save();

            res.status(statuscode.OK).json({ 
                success: true, 
                message: responseMessage.ADDRESS_DELETED 
            });
        } catch (error) {

            console.error("Error deleting address:", error);

            if (!res.headersSent) {
                res.status(statuscode.INTERNAL_SERVER_ERROR).json({ 
                    success: false, 
                    message: responseMessage.SERVER_ERROR 
                });
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
        return res.status(statuscode.NOT_FOUND).render("orders", {
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
      res.status(statuscode.INTERNAL_SERVER_ERROR).render("orders", {
        success: false,
        message: responseMessage.SERVER_ERROR,
      });
    }
  };


  const wallet = async(req,res)=>{
    const userId = req.session.user;
    try{
        const user = await User.findById(userId)
        const wallet = user.wallet.transactions.reverse();
        res.render("wallet", {wallet, user})

       }catch(error){
        console.error(error)
        res.status(statuscode.INTERNAL_SERVER_ERROR).json({ 
            success: false, 
            message: responseMessage.SERVER_ERROR
       })
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
    getOrders,
    wallet
}