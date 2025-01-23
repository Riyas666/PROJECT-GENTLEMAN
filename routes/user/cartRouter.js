//IMPORT THE MODULES

const express = require("express");
const router = express.Router();
const { userAuth } = require("../../middlewares/auth");
const cartController = require("../../controllers/user/cartController");



router.get("/", userAuth, cartController.getCart)
router.post("/update", userAuth, cartController.updateCart);
router.get("/addToCart", userAuth, cartController.addToCart)
router.post("/addToCart", cartController.addToCartDetails);





module.exports = router;