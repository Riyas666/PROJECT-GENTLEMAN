const express = require("express");
const router = express.Router();
const { adminAuth } = require("../../middlewares/auth");
const customerController = require("../../controllers/admin/customerController");





//RELATED TO CUSTOMER MANAGEMENT
router.get("/",adminAuth, customerController.customerInfo);
router.patch("/blockCustomer",adminAuth, customerController.customerBlocked);
router.patch("/unblockCustomer",adminAuth, customerController.customerunBlocked);

//EXPORTING
module.exports = router;