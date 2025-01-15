//IMPORT THE MODULES

const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin/adminController");
const customerController = require("../controllers/admin/customerController");
const categoryController = require("../controllers/admin/categoryController")
const productController = require("../controllers/admin/productController")
const brandController = require("../controllers/admin/brandController")

const { uploadProductImage , uploadBrandImage } = require('../utils/multer');

const { userAuth, adminAuth } = require("../middlewares/auth");
const multer = require("multer");
const storage = require("../utils/multer");
const uploads = multer({brandStorage:storage});



//TO SHOW THE ERROR


router.get("/pageerror",adminAuth, adminController.pageerror);

//RELATED TO ADMIN LOGIN
router.get("/login", adminAuth,adminController.loadLogin);
router.post("/login", adminAuth,adminController.login);

//AFTER ADMIN LOGIN, LOAD DASHBOARD
router.get("/dashboard",adminAuth, adminController.loadDashboard);

//LOGOUT FROM THE ADMIN LOGIN
router.get("/logout",adminAuth, adminController.logout);


//RELATED TO CUSTOMER MANAGEMENT
router.get("/users",adminAuth, customerController.customerInfo);
router.patch("/blockCustomer",adminAuth, customerController.customerBlocked);
router.patch("/unblockCustomer",adminAuth, customerController.customerunBlocked);
router.get("/category",adminAuth,  categoryController.categoryInfo);


//RELATED TO CATEGORY MANAGEMENT
router.post("/addCategory",adminAuth, categoryController.addCategory)
router.get("/listCategory",adminAuth, categoryController.getListCategory)
router.get("/unlistCategory",adminAuth, categoryController.getUnListCategory)
router.get("/editCategory",adminAuth, categoryController.getEditCategory)
router.post("/editCategory/:id",adminAuth, categoryController.editCategory)


//RELATED TO PRODUCT MANAGEMENT
router.get("/addProducts", adminAuth,productController.getProductAddPage)

router.post('/addProducts',adminAuth, uploadProductImage.array('productImage', 5), productController.addProducts);

router.get("/products",adminAuth,productController.getAllProducts)

//BLOCK AND UNBLOCK PRODUCT

router.patch("/blockProduct",adminAuth,productController.blockProduct);
router.patch("/unblockProduct",adminAuth, productController.unblockProduct);


router.get("/editProduct",adminAuth, productController.getEditProduct)

router.post("/editProduct/:id",adminAuth, uploadProductImage.array('productImage', 5), productController.editProduct)


router.post("/deleteImage",adminAuth, productController.deleteSingleImage)


//BRAND CONTROLLER


router.get("/brands",adminAuth, brandController.getBrandPage)

router.post("/addBrand",adminAuth, uploadBrandImage.single("image"), brandController.addBrand)

router.patch("/blockBrand",adminAuth,brandController.blockBrand);
router.patch("/unblockBrand",adminAuth, brandController.unblockBrand);
 


//EXPORTING
module.exports = router;