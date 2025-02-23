const express = require("express")
const router = express.Router()
const { uploadProductImage } = require('../../utils/multer');
const productController = require("../../controllers/admin/productController")
const orderController = require("../../controllers/admin/orderController")
const { adminAuth } = require("../../middlewares/auth");
const multer = require("multer");
const storage = require("../../utils/multer");
const uploads = multer({brandStorage:storage});


//RELATED TO PRODUCT MANAGEMENT
router.get("/",adminAuth,productController.getAllProducts)
router.get("/addProducts", adminAuth,productController.productAddPage)
router.post('/addProducts',adminAuth, uploadProductImage.array('productImage', 4), productController.addProducts);


//BLOCK AND UNBLOCK PRODUCT

router.patch("/blockProduct",adminAuth,productController.blockProduct);
router.patch("/unblockProduct",adminAuth, productController.unblockProduct);


router.get("/editProduct",adminAuth, productController.getEditProduct)
router.post("/editProduct/:id",adminAuth, uploadProductImage.array('images', 4), productController.editProduct)
router.post("/deleteImage",adminAuth, productController.deleteSingleImage)




module.exports = router