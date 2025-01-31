//IMPORT THE MODULES

const express = require("express");
const router = express.Router();
const adminController = require("../../controllers/admin/adminController");
const { adminAuth } = require("../../middlewares/auth");
const couponController = require("../../controllers/admin/couponController")


//RELATED TO ADMIN LOGIN
router.get("/login", adminController.loadLogin);
router.post("/login", adminController.login);
router.get("/dashboard",adminAuth, adminController.loadDashboard);
router.get("/logout",adminAuth, adminController.logout);


//TO SHOW THE ERROR
router.get("/pageerror",adminAuth, adminController.pageerror);



//coupon management

router.get("/coupon", adminAuth, couponController.getCoupon)

router.post("/createCoupon", adminAuth, couponController.createCoupon)
router.get("/editCoupon", adminAuth, couponController.editCoupon);
router.post("/updateCoupon", adminAuth, couponController.updateCoupon);
router.get("/deleteCoupon", adminAuth,couponController.deleteCoupon)

//EXPORTING
module.exports = router;