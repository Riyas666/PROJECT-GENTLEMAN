//IMPORT THE MODULES

const express = require("express");
const router = express.Router();
const adminController = require("../../controllers/admin/adminController");
const { adminAuth } = require("../../middlewares/auth");
const couponController = require("../../controllers/admin/couponController")
const dashboardController = require("../../controllers/admin/dashboardController")


const brandRoutes = require("./brandRouter");
const categoryRoutes = require("./categoryRouter");
const customerRoutes = require("./customerRouter");
const orderRoutes = require("./orderRouter");
const productRoutes = require("./productRouter");


router.use("/products", productRoutes);
router.use("/brands", brandRoutes);
router.use("/users", customerRoutes);
router.use("/category", categoryRoutes);
router.use("/orders", orderRoutes);

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
router.delete("/deleteCoupon", adminAuth,couponController.deleteCoupon)

router.post("/generate-report",dashboardController.generateReport)
router.post("/generate-sales-graph",dashboardController.generateGraph);
router.get("/productoffer", adminController.getProductOffer)
router.post("/createOffer", adminController.createOffer);
router.patch("/deleteOffer/:id", adminController.removeOffer);



module.exports = router;