//IMPORT THE MODULES

const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin/adminController");
const customerController = require("../controllers/admin/customerController");
const categoryController = require("../controllers/admin/categoryController")
const productController = require("../controllers/admin/productController")

const { uploadProductImage } = require('../utils/multer');
const { userAuth, adminAuth } = require("../middlewares/auth");
//TO SHOW THE ERROR

router.get("/pageerror", adminController.pageerror);

//RELATED TO ADMIN LOGIN
router.get("/login", adminController.loadLogin);
router.post("/login", adminController.login);

//AFTER ADMIN LOGIN, LOAD DASHBOARD
router.get("/dashboard", adminController.loadDashboard);

//LOGOUT FROM THE ADMIN LOGIN
router.get("/logout", adminController.logout);


//RELATED TO CUSTOMER MANAGEMENT
router.get("/users", customerController.customerInfo);
router.patch("/blockCustomer", customerController.customerBlocked);
router.patch("/unblockCustomer", customerController.customerunBlocked);
router.get("/category",  categoryController.categoryInfo);


//RELATED TO CATEGORY MANAGEMENT
router.post("/addCategory", categoryController.addCategory)
router.get("/listCategory", categoryController.getListCategory)
router.get("/unlistCategory", categoryController.getUnListCategory)
router.get("/editCategory", categoryController.getEditCategory)
router.post("/editCategory/:id", categoryController.editCategory)


//RELATED TO PRODUCT MANAGEMENT
router.get("/addProducts", productController.getProductAddPage)

router.post('/addProducts', uploadProductImage.array('productImage', 5), productController.addProducts);

router.get("/products", productController.getAllProducts)

//BLOCK AND UNBLOCK PRODUCT

router.patch("/blockProduct",productController.blockProduct);
router.patch("/unblockProduct", productController.unblockProduct);


router.get("/editProduct", productController.getEditProduct)

router.post("/editProduct/:id", uploadProductImage.array('productImage', 5), productController.editProduct)



router.post("/deleteImage", productController.deleteSingleImage)


//EXPORTING
module.exports = router;
