//IMPORT THE MODULES

const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin/adminController");
const customerController = require("../controllers/admin/customerController");
const brandController = require("../controllers/admin/brandController")

const {  uploadBrandImage } = require('../utils/multer');

const { adminAuth } = require("../middlewares/auth");
const multer = require("multer");
const storage = require("../utils/multer");
const uploads = multer({brandStorage:storage});



//TO SHOW THE ERROR
router.get("/pageerror",adminAuth, adminController.pageerror);


//RELATED TO ADMIN LOGIN
router.get("/login", adminController.loadLogin);
router.post("/login", adminController.login);
router.get("/dashboard",adminAuth, adminController.loadDashboard);
router.get("/logout",adminAuth, adminController.logout);




//RELATED TO CUSTOMER MANAGEMENT
router.get("/users",adminAuth, customerController.customerInfo);
router.patch("/blockCustomer",adminAuth, customerController.customerBlocked);
router.patch("/unblockCustomer",adminAuth, customerController.customerunBlocked);




//EXPORTING
module.exports = router;