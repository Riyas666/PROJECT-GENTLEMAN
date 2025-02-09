//IMPORT THE MODULES

const express = require("express");
const router = express.Router();
const { userAuth } = require("../../middlewares/auth");
const cartController = require("../../controllers/user/cartController");



router.get("/", userAuth, cartController.getCart)
router.post("/update", userAuth, cartController.updateCart);
router.post('/delete', userAuth,cartController.deleteCartItem);

router.post("/addToCart", userAuth, cartController.addToCartDetails);
router.get("/check-stock", userAuth, cartController.checkStockAvailability)

module.exports = router;