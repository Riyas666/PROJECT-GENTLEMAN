//IMPORT THE MODULES

const express = require("express");
const router = express.Router();
const passport = require("passport");
const { userAuth } = require("../middlewares/auth");
const userController = require("../controllers/user/userController");
const profileController = require("../controllers/user/profileController");
const productController = require("../controllers/user/productController");
const orderController = require("../controllers/user/orderController");
const cartController = require("../controllers/user/cartController")
const wishlistController = require("../controllers/user/wishlistController")


//TO DISPLAY PAGE NOT FOUND PAGE
router.get("/pageNotFound", userController.pageNotFound);

//LOAD HOME PAGE
router.get("/home", userController.loadHomePage);

//LOAD THE LOGIN PAGE
router.get("/login", userController.loadLogin);
router.post("/login", userController.login);
router.post("/resend-otp", userController.resendOtp);
router.get("/logout", userController.logout);

//LOAD SIGNUP PAGE
router.get("/signup", userController.loadSignup);

//LOAD SHOP PAGE
router.get("/shop", productController.loadShopping);
router.get("/productDetails", productController.productDetails);


//HANDLE SIGNUP FORM
router.post("/signup", userController.signup);

//AFTER SIGNUP VERIFY-OTP
router.post("/verify-otp", userController.verifyOtp);

//ONE STEP AUTHENTICATION ROUTE
router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/auth/google/callback", passport.authenticate("google", { failureRedirect: "/signup" }), (req, res) => {
    console.log(`req.user___${req.user}`)
    req.session.userData = { name:req.user.name, email: req.user.email, password:req.user.password };
    res.redirect("/home");
});



//PROFILE
router.get("/forgot-password", profileController.forgotPassword);
router.post("/forgot-email-valid", profileController.forgotEmailValid);
router.post("/verify-passForgot-otp", profileController.verifyForgotPassOtp);
router.get("/reset-password", profileController.getResetPassPage);
router.post("/reset-password", profileController.resetPassword);
router.post("/resend-forgot-otp", profileController.resendOtp);





router.get("/checkout",userAuth, orderController.loadCheckoutPage);
router.get('/order/success', orderController.loadOrderCompletedPage);
router.post('/place', orderController.placeOrder);
router.get("/order-details/:id", orderController.orderDetails)
router.post('/profile/cancel-order', orderController.cancelOrder);










router.get("/wishlist", wishlistController.getWishlist)
router.post("/addToWishlist", userAuth,wishlistController.addToWishlist)
router.post('/wishlist/delete', wishlistController.deleteWishlistItem);
// router.post("/wishlist/remove", wishlistController.removeFromWishlist)




router.post("/apply-coupon",userAuth, cartController.applyCoupon)

router.post('/create-order', orderController.createOrder);

router.post('/verify-payment', orderController.verifyPayment); 



module.exports = router;