const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin/adminController");
const customerController = require("../controllers/admin/customerController");
const categoryController = require("../controllers/admin/categoryController")
const { userAuth, adminAuth } = require("../middlewares/auth");

router.get("/pageerror", adminController.pageerror);
router.get("/login", adminController.loadLogin);
router.post("/login", adminController.login);

router.get("/dashboard", adminController.loadDashboard);
router.get("/logout", adminController.logout);
router.get("/users", customerController.customerInfo);
router.post("/blockCustomer", customerController.customerBlocked);
router.post("/unblockCustomer", customerController.customerunBlocked);
router.get("/category",  categoryController.categoryInfo)
router.post("/addCategory", categoryController.addCategory)
router.get("/listCategory", categoryController.getListCategory)
router.get("/unlistCategory", categoryController.getUnListCategory)
router.get("/editCategory", categoryController.getEditCategory)
router.post("/editCategory/:id", categoryController.editCategory)

module.exports = router;
