const Order = require("../../models/orderSchema")

const getOrderList = async (req,res)=>{

   const orders = await Order.find({}).populate("orderedItems.products")
   console.log("this is the orders", orders)

   console.log("this is the orders", orders)
   res.render("order", {orders})


}

const getOrderDetails = async (req, res) => {
   try {
     const {id}   = req.params;
     console.log("zzz", id)
     const orders = await Order.findById(id).populate({
      path: "orderedItems.products",
      select: "productName sizes productImage" // Only fetch required fields
   });
      
 console.log("hehehe", orders)
     if (!orders) {
       return res.status(404).json({ message: 'Order not found' });
     }
 
     res.json({order:orders});

   } catch (error) {
     console.error(error);
     res.status(500).json({ message: 'Error fetching order details' });
   }
 };
 

 const changeOrderStatus = async (req, res) => {
   const { orderId, newStatus } = req.body;
   try {

     const order = await Order.findById(orderId);
     if (!order) {
       return res.status(404).json({ message: 'Order not found' });
     }

     order.status = newStatus;
     await order.save();

     return res.status(200).json({ message: 'Order status updated successfully' });
   } catch (error) {
     console.error('Error updating order status:', error);
     return res.status(500).json({ message: 'Error updating order status' });
   }
 };
 
 
module.exports = {
   getOrderList,
   getOrderDetails,
   changeOrderStatus
}