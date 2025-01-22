//IMPORT THE MODULES

const express = require("express");
const router = express.Router();
const adminController = require("../../controllers/admin/adminController");
const { adminAuth } = require("../../middlewares/auth");





//RELATED TO ADMIN LOGIN
router.get("/login", adminController.loadLogin);
router.post("/login", adminController.login);
router.get("/dashboard",adminAuth, adminController.loadDashboard);
router.get("/logout",adminAuth, adminController.logout);


//TO SHOW THE ERROR
router.get("/pageerror",adminAuth, adminController.pageerror);




//EXPORTING
module.exports = router;