const express = require("express")
const router = express.Router()
const { adminAuth } = require("../../middlewares/auth");
const orderController = require("../../controllers/admin/orderController")

router.get("/",  adminAuth, orderController.allOrders)
router.get('/:id',  adminAuth, orderController.orderDetails);
router.patch('/change-status',  adminAuth, orderController.changeOrderStatus);
router.post('/return-requests/approve/:orderId', orderController.approveReturnRequest);
router.get("/return-requests/details", orderController.returnRequestDetails)

// Route to reject the return request
router.post('/return-requests/reject/:orderId',orderController. rejectReturnRequest);

module.exports = router;