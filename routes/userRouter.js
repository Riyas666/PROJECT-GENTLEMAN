//IMPORT THE MODULES

const express = require("express");
const router = express.Router();
const passport = require("passport");
const { userAuth } = require("../middlewares/auth");
const userController = require("../controllers/user/userController");
const profileController = require("../controllers/user/profileController");
const productController = require("../controllers/user/productController");
const personalController =require("../controllers/user/personalController")

//TO DISPLAY PAGE NOT FOUND PAGE
router.get("/pageNotFound", userController.pageNotFound);

//LOAD HOME PAGE
router.get("/home",userAuth, userController.loadHomePage);

//LOAD THE LOGIN PAGE
router.get("/login", userController.loadLogin);
router.post("/login", userController.login);
router.post("/resend-otp", userController.resendOtp);
router.get("/logout", userController.logout);

//LOAD SIGNUP PAGE
router.get("/signup", userController.loadSignup);

//LOAD SHOP PAGE
router.get("/shop",userAuth, userController.loadShopping);

//HANDLE SIGNUP FORM
router.post("/signup", userController.signup);

//AFTER SIGNUP VERIFY-OTP
router.post("/verify-otp", userController.verifyOtp);

//ONE STEP AUTHENTICATION ROUTE
router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/auth/google/callback", passport.authenticate("google", { failureRedirect: "/signup" }), (req, res) => {
    res.redirect("/home");
});

//PROFILE
router.get("/forgot-password", profileController.forgotPassword);

router.post("/forgot-email-valid", profileController.forgotEmailValid);
router.post("/verify-passForgot-otp", profileController.verifyForgotPassOtp);
router.get("/reset-password", profileController.getResetPassPage);
router.post("/reset-password", profileController.resetPassword);
router.post("/resend-forgot-otp", profileController.resendOtp);

//Product amanagement

router.get("/cart", userAuth, personalController.getCart)



router.get("/productDetails",userAuth, productController.productDetails);





router.get("/profile", userAuth, personalController.profilePage)
router.post('/profile/update', userAuth, personalController.updateProfile);

router.get("/profile/change-password", userAuth, personalController.getChangePassword)
router.post("/profile/change-password", userAuth, personalController.changePassword)



router.get("/profile/address", userAuth, personalController.getAddressPage)

router.post('/profile/add-address', userAuth, personalController.addAddress);


// Express.js route to handle address deletion
router.delete('/deleteAddress/:id', (req, res) => {
    const addressId = req.params.id;
    
    // Assuming you have a model for addresses, use it to delete the address
    Address.findByIdAndDelete(addressId, (err) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error deleting address' });
      }
      res.status(200).json({ success: true, message: 'Address deleted successfully' });
    });
  });
  



module.exports = router;
