const Order = require("../../models/orderSchema")
const User = require("../../models/userSchema")
const Product = require("../../models/productSchema")

const allOrders = async (req,res)=>{
   const orderdetails = await Order.find({}).populate("orderedItems.products");
   const orders = orderdetails.reverse();
   res.render("order", {orders});
}

const orderDetails = async (req, res) => {
   try {
     const {id}   = req.params;
     const orders = await Order.findById(id).populate({
      path: "orderedItems.products",
      select: "productName sizes productImage"
   });
      
   if (!orders){
    return res.status(404).json({ message: 'Order not found' });
   }
   res.json({order:orders});   

   } catch (error) {
     console.error(error);
     res.status(500).json({ message: 'Error fetching order details' });
   };
 };
 

 const changeOrderStatus = async (req, res) => {

  const { orderId, newStatus } = req.body;
  try {

    const order = await Order.findById(orderId);
    if (!order) {
       return res.status(404).json({ message: 'Order not found' });
    }

    order.status = newStatus;
    if(order.status==="Delivered"){
    order.paymentStatus= "Success";
    }

    await order.save();
    return res.status(200).json({ message: 'Order status updated successfully' });
   } catch (error) {
    console.error('Error updating order status:', error);
    return res.status(500).json({ message: 'Error updating order status' });
   };
 };


const approveReturnRequest = async (req, res) => {
  const {orderId} = req.params;
  const { refundAmount } = req.body;
  const userId = req.session.user;

  try {
    const order = await Order.findOne({ orderId }).populate('orderedItems.products');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.paymentStatus === 'Success') {
      const user = await User.findById(order.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      user.wallet.balance += refundAmount;
      user.wallet.transactions.push({
        type: 'Credit',
        amount: refundAmount,
        description: `Refund for Order #${orderId}`,
      });

      await user.save();

      for (const item of order.orderedItems) {
        const product = await Product.findById(item.products);
        if (product) {
          const sizeToUpdate = product.sizes.find(
            (size) => size.size == item.size
          );
          if (sizeToUpdate) {
            sizeToUpdate.quantity += item.quantity; 
          }
          await product.save();
        };
      };

      order.status = 'Returned';
      await order.save();
      return res.status(200).json({ success: true, userId: userId, message: 'Return approved and refund processed' });
    } else {
      return res.status(400).json({ message: 'Payment not successful. Cannot process the return.' });
    }
  } catch (error) {
    console.error('Error processing return request:', error);
    return res.status(500).json({ message: 'Error processing return request' });
  }
};

const rejectReturnRequest = async (req, res) => {
  const { orderId } = req.params;
  try {
    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = 'Return Rejected';
    await order.save();

    return res.status(200).json({ success: true, message: 'Return request rejected' });
  } catch (error) {
    console.error('Error rejecting return request:', error);
    return res.status(500).json({ message: 'Error rejecting return request' });
  }
};
  

 const returnRequestDetails = async(req,res) =>{
  try{
     const orders = await Order.find({status:"Return Request"}).populate({
      path: "orderedItems.products",
      select: "productName productImage" 
   });

     res.json(orders.map(order=>({
      orderId:order.orderId,
      products: order.orderedItems.map(item => ({
        productName: item.products.productName,
        productImage: item.products.productImage
      })),
      returnReason:order.returnReason,
      refundAmount:order.finalAmount
     })))
  }catch(error){
    console.error('Error fetching return request details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
 }
 
module.exports = {
   allOrders,
   orderDetails,
   changeOrderStatus,
   rejectReturnRequest,
  approveReturnRequest,
      returnRequestDetails
}