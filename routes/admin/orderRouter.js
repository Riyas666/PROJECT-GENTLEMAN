const express = require("express")
const router = express.Router()
const { adminAuth } = require("../../middlewares/auth");
const orderController = require("../../controllers/admin/orderController")

router.get("/",  adminAuth, orderController.allOrders)
router.get('/:id',  adminAuth, orderController.orderDetails);
router.patch('/change-status',  adminAuth, orderController.changeOrderStatus);


module.exports = router;