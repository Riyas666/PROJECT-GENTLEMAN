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
router.get("/", userController.loadHomePage);
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
    req.login(req.user, (err) => {
        if(err) {
            console.error("Login Error:", err);
            return res.redirect("/signup")
        }
        
        req.session.userData = req.user;
        req.session.user = req.session.userData._id;
        
        console.log("dcdc", req.session.userData)
        res.redirect("/home")
    })

});



//PROFILE
router.get("/forgot-password", userAuth,profileController.forgotPassword);
router.post("/forgot-email-valid",userAuth, profileController.forgotEmailValid);
router.post("/verify-passForgot-otp", profileController.verifyForgotPassOtp);
router.get("/reset-password",userAuth, profileController.getResetPassPage);
router.post("/reset-password",userAuth, profileController.resetPassword);
router.post("/resend-forgot-otp", userAuth,profileController.resendOtp);





router.get("/checkout",userAuth, orderController.loadCheckoutPage);
router.get('/order/success',userAuth, orderController.loadOrderCompletedPage);
router.post('/place',userAuth, orderController.placeOrder);
router.get("/order-details/:id",userAuth, orderController.orderDetails)
router.post('/profile/cancel-order', userAuth,orderController.cancelOrder);
router.post('/profile/return-order', userAuth,orderController.returnOrder)
router.post('/retry-payment', orderController.retryPayment);






router.get("/wishlist",userAuth, wishlistController.getWishlist)
router.post("/addToWishlist", userAuth,wishlistController.addToWishlist)
router.post('/wishlist/delete',userAuth, wishlistController.deleteWishlistItem);
router.post("/wishlist/remove", wishlistController.removeFromWishlist)




router.post("/apply-coupon",userAuth, cartController.applyCoupon)
router.post('/place-order-online',userAuth, orderController.placeOrderOnline);
router.post('/verify-payment', userAuth,orderController.verifyPayment); 
router.post('/verify-retry-payment', userAuth, orderController.verifyRetryPayment)

module.exports = router;