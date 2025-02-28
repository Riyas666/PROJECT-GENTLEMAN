const express = require("express");
const router = express.Router();
const categoryController = require("../../controllers/admin/categoryController")
const {  adminAuth } = require("../../middlewares/auth");




//RELATED TO CATEGORY MANAGEMENT
router.get("/",adminAuth,  categoryController.categoryInfo);
router.post("/addCategory",adminAuth, categoryController.addCategory)
// router.get("/listCategory",adminAuth, categoryController.getListCategory)
// router.get("/unlistCategory",adminAuth, categoryController.getUnListCategory)
router.get("/editCategory/:id",adminAuth, categoryController.getEditCategory)
router.post("/editCategory/:id",adminAuth, categoryController.editCategory);
router.patch("/list", adminAuth, categoryController.listCategory);
router.patch("/unlist", adminAuth, categoryController.unlistCategory);




module.exports = router;