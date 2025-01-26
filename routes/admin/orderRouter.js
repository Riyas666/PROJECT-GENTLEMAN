const express = require("express")
const router = express.Router()
const orderController = require("../../controllers/admin/orderController")

router.get("/",  orderController.getOrderList )
router.get('/:id', orderController.getOrderDetails);
router.patch('/change-status', orderController.changeOrderStatus);


module.exports = router;