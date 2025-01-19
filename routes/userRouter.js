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
router.post("/profile/change-password", userAuth, personalController.changePassword)
router.post('/profile/add-address', userAuth, personalController.addAddress);



module.exports = router;
