//IMPORT THE MODULES

const express = require("express");
const router = express.Router();
const adminController = require("../../controllers/admin/adminController");
const { adminAuth } = require("../../middlewares/auth");
const couponController = require("../../controllers/admin/couponController")
const dashboardController = require("../../controllers/admin/dashboardController")

//RELATED TO ADMIN LOGIN
router.get("/login", adminController.loadLogin);
router.post("/login", adminController.login);
router.get("/dashboard", dashboardController.loadDashboard);
router.get("/logout",adminAuth, adminController.logout);


//TO SHOW THE ERROR
router.get("/pageerror",adminAuth, adminController.pageerror);



//coupon management

router.get("/coupon", adminAuth, couponController.getCoupon)

router.post("/createCoupon", adminAuth, couponController.createCoupon)
router.get("/editCoupon", adminAuth, couponController.editCoupon);
router.post("/updateCoupon", adminAuth, couponController.updateCoupon);
router.get("/deleteCoupon", adminAuth,couponController.deleteCoupon)




router.post("/generate-report",dashboardController.generateReport)
router.post("/generate-sales-graph",dashboardController.generateGraph);

router.get("/productoffer", adminController.getProductOffer)
router.post("/createOffer", adminController.createOffer);
router.patch("/deleteOffer/:id", adminController.removeOffer);



module.exports = router;