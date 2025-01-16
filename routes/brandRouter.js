const express = require("express");
const router = express.Router();
const brandController = require("../controllers/admin/brandController")
const {  uploadBrandImage } = require('../utils/multer');
const { adminAuth } = require("../middlewares/auth");




router.get("/",adminAuth, brandController.getBrandPage)
router.post("/addBrand",adminAuth, uploadBrandImage.single("image"), brandController.addBrand)
router.patch("/blockBrand",adminAuth,brandController.blockBrand);
router.patch("/unblockBrand",adminAuth, brandController.unblockBrand);


module.exports = router;