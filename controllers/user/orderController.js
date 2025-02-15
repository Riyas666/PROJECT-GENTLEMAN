const Product = require("../../models/productSchema");
const Cart = require("../../models/cartSchema");
const Address = require("../../models/addressSchema");
const Order = require("../../models/orderSchema");
const Coupon = require("../../models/couponSchema")
const User = require("../../models/userSchema");
const Razorpay  = require("razorpay")
const crypto = require('crypto');
const generateOrderId = require("../../utils/generateorderid");


const razorpayInstance  = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});


const loadCheckoutPage = async (req, res) => {
    try {
      const userId = req.session.user;
      const user = await User.findOne({_id:userId});
      const cart = await Cart.findOne({ userId }).populate("items.productId");
      const coupons = await Coupon.find({});

      if (!cart || cart.items.length === 0) {
        return res.redirect("/cart")
      }

      let totalAmount = 0;
      let offerDiscount = 0;

      cart.items.forEach(item=>{
        let originalPrice = item.price * item.quantity;
        let productOffer = item.productId.offerPercentage || 0;
        let categoryOffer = item.productId.categoryPercentage || 0;
        let appliedOffer = Math.max(productOffer, categoryOffer);
        let discountAmount = (originalPrice * appliedOffer) / 100;
        offerDiscount +=discountAmount;
        totalAmount +=originalPrice;
      })

      const userAddresses = await Address.findOne({ userId });
      res.render("checkout", {
        user,
        cart: cart.items, 
        totalAmount,
        offerDiscount,
        addresses: userAddresses ? userAddresses.address : [], 
        coupons
      });

    } catch (error) {
      console.error("Error loading checkout page:", error);
      res.status(500).send("An error occurred while loading the checkout page.");
    }
  };

  const placeOrder = async (req, res) => {
    try {

      const coupons = req.session.coupon;
      const userId = req.session.user; 
      const { addressId, paymentMethod , offerdiscount} = req.body; 
        if (!addressId || !paymentMethod) {
            return res.status(400).json({ success: false, message: "Invalid order details" });
        }  
      const discount = offerdiscount + coupons?coupons.discountAmount : 0;
      const cart = await Cart.findOne({ userId })
        if (!cart || cart.items.length === 0) {
            return res.status(404).json({ success: false, message: "Cart is empty" });
        }

        const productIds = cart.items.map((item) => item.productId);
        const products = await Product.find({ _id: { $in: productIds } });
        for (const item of cart.items) {
            const product = products.find((prod) => prod._id.toString() == item.productId.toString());
            if (!product) {
                return res.status(404).json({ success: false, message: `Product with ID ${item.productId} not found` });
            }
            const sizeObject = product.sizes.find((sizes) => sizes.size == item.size);
            if (!sizeObject || sizeObject.quantity < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Stock not available for ${product.productName} (Size: ${item.size})`,
                });
            }         
        }
  
        for (const item of cart.items) {
            const product = products.find((prod) => prod._id.toString() === item.productId.toString());
            const sizeObject = product.sizes.find((sizes) => sizes.size == item.size);
            sizeObject.quantity -= item.quantity;
            await product.save();
        }
  
        const totalPrice = cart.items.reduce((acc, item) => acc + item.totalPrice, 0);
        const address = await Address.findOne({ userId, "address._id": addressId });
         const finalAmount = totalPrice - discount;
        if (!address) {
            return res.status(404).json({ success: false, message: "Address not found" });
        }
        const selectedAddress = address.address.find(addr => addr._id == addressId);
        console.log("This is the selected address", selectedAddress);

  if (!selectedAddress) {
      return res.status(404).json({ success: false, message: "Address not found" });
  }
        const newOrder = new Order({
          userId,
          orderId:generateOrderId(),
          orderedItems: cart.items.map((item) => ({
          products: item.productId,
          productName : item.productName,
          productImage : item.productImage,
          size: item.size,
          quantity: item.quantity,
          price: item.totalPrice,
        })),
        couponApplied: coupons?true:false,
          address: selectedAddress,
          totalPrice,
          discount,
          finalAmount,
          status: 'Pending',
          paymentType:paymentMethod,
          paymentStatus:'Pending'
        });
        
        const orderId = newOrder.orderId
        switch(paymentMethod){
          case 'COD':
            await newOrder.save();
            break;
          case 'Wallet':
            const user = await User.findById(userId);
            if(user.wallet.balance< finalAmount){
              return res.status(400).json({
                success:false,
                message:"Not enough balance in wallet"
              })
            }
            user.wallet.balance-=finalAmount;
            user.wallet.transactions.push({
              type: 'Debit',
              amount: finalAmount,
              description: `For Order #${orderId}`,
            });
            await user.save()
            newOrder.paymentStatus = 'Success';
            newOrder.save()
            break;
          default:
            return res.status(400).json({
              success:false,
              message:'Invalid payment method'
            })
        }
  
        cart.items = [];
        await cart.save();
  
        res.status(200).json({ 
          success: true, 
          message: "Order placed successfully!", 
          redirectUrl: "/order/success", 
          orderId: newOrder.orderId ,
          amount: finalAmount * 100,
      });
    } catch (error) {
        console.error("Error placing order:", error);
        res.status(500).json({ success: false, message: "Failed to place order. Please try again." });
    }
  };


  const loadOrderCompletedPage = async (req, res) => {
    try {
      res.render("orderplacedsuccessfully", {
        success: true,
      });
    } catch (error) {
      console.error("Error loading order completion page:", error);
      res.status(500).render("orderplacedsuccessfully", {
        success: false,
        message: "An error occurred while loading the order confirmation.",
      });
    }
  };
  

const orderDetails = async(req,res)=>{
    
    const id = req.params.id;
    console.log("This is the order id", id)
    try{
       
        const orders = await Order.findById(id).populate("orderedItems.products").populate("address")
        console.log("This is the order that you are ordered", orders)
        const estimatedDeliveryDate = new Date(orders.createdAt);
        estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 2);
        res.render("orderdetails", {orders, estimatedDeliveryDate})

    } catch(error) {
      console.log(error)
    }
}
const cancelOrder = async (req, res) => {
  const { orderId, status, reason } = req.body;

  try {
    const order = await Order.findOne({ orderId }).populate('orderedItems.products');
    console.log("This is the Oorders", order) 
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (order.paymentStatus === 'Success' && status === 'Cancelled') {
      const user = await User.findById(order.userId);
      if (user) {
        user.wallet.balance += order.finalAmount;
      
        user.wallet.transactions.push({
          type: 'Credit',
          amount: order.finalAmount,
          description: `Refund for Order #${orderId}`,
        });

        await user.save(); 
        console.log(`Refunded ₹${order.finalAmount} to user wallet`);
      } else {
        return res.status(404).json({ message: 'User not found' });
      }
    }
    if (status === 'Cancelled') {
    for (const item of order.orderedItems) {
      const product = await Product.findById(item.products);
      console.log("This is product", product)

      if (product) {
        const sizeToUpdate = product.sizes.find(
          (size) => size.size == item.size
        );
        console.log("This is the sizeToUpdate", sizeToUpdate)

        if (sizeToUpdate) {
 
          sizeToUpdate.quantity += item.quantity;
        }

        await product.save(); 
      }
    }
    }

    order.status = status;
    order.cancelReason = reason

    await order.save(); 

    res.status(200).json({ message: 'Order cancelled successfully, and stock updated' });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ message: 'Failed to cancel the order' });
  }
};



const placeOrderOnline = async (req, res) => {
  try {
    const coupons = req.session.coupon;
    const userId = req.session.user; 
    const {  addressId,  paymentMethod } = req.body;
    
const cart = await Cart.findOne({userId})
if (!cart || cart.items.length === 0) {
  return res.status(404).json({ success: false, message: "Cart is empty" });
}

const productIds = cart.items.map((item) => item.productId);
const products = await Product.find({ _id: { $in: productIds } });
for (const item of cart.items) {
  const product = products.find((prod) => prod._id.toString() === item.productId.toString());
  if (!product) {
      return res.status(404).json({ success: false, message: `Product with ID ${item.productId} not found` });
  }
  const sizeObject = product.sizes.find((sizes) => sizes.size == item.size);

          if (!sizeObject || sizeObject.quantity < item.quantity) {
              return res.status(400).json({
                  success: false,
                  message: `Stock not available for ${product.productName} (Size: ${item.size})`,
              });
          }         
      }
      
      for (const item of cart.items) {
          const product = products.find((prod) => prod._id.toString() === item.productId.toString());
          const sizeObject = product.sizes.find((sizes) => sizes.size == item.size);
          sizeObject.quantity -= item.quantity;

          await product.save();
      }
      const totalPrice = cart.items.reduce((acc, item) => acc + item.totalPrice, 0);
      const finalAmount = totalPrice ; 
      const address = await Address.findOne({ userId, "address._id": addressId });
      const selectedAddress = address.address.find(addr => addr._id == addressId);
      console.log("this is address", selectedAddress)
    const options = {
      amount: coupons?coupons.finalAmount*100:finalAmount*100, 
      currency: 'INR',
      receipt: `order_rcptid_${Math.floor(Math.random() * 10000)}`,
    };

    console.log("Creating order with options:", options);
console.log("hahahaha", razorpayInstance)
    const razorpayOrder = await razorpayInstance.orders.create(options);

 const order = new Order({
  userId: userId,
  orderId: razorpayOrder.id,
  orderedItems : cart.items.map((item) => ({
      products: item.productId,
      productName : item.productName,
      productImage : item.productImage,
      size: item.size,
      quantity: item.quantity,
      price: item.totalPrice,
  })),
  couponApplied:coupons?true:false,
  address: selectedAddress,
  totalPrice: totalPrice ,
  discount:coupons?coupons.discountAmount:0,
  finalAmount:coupons?coupons.finalAmount:finalAmount,
  status: "Pending", 
  paymentType: paymentMethod, 
  paymentStatus: "Pending", 
});


console.log("this is the orders", order)

await order.save();
cart.items = [];
await cart.save();




console.log("this is razzzzzzzzz", razorpayOrder)

res.json({ success: true, razorpayOrder });    
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

const verifyPayment = async (req, res) => {


  const verifyPaymentSignature = (orderId, paymentId, signature) => {
      const generatedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET) 
          .update(`${orderId}|${paymentId}`)
          .digest('hex');
  
      return generatedSignature === signature;
  };
  try {
      const { paymentId, orderId, signature } = req.body;

      const isValidSignature = verifyPaymentSignature(orderId, paymentId, signature);
      console.log("Is valid signature:", isValidSignature);

      if (!isValidSignature) {
          return res.status(400).json({ error: 'Payment verification failed' });
      }

      const order = await Order.findOne({ orderId: orderId });
      if (!order) {
          return res.status(404).json({ error: 'Order not found' });
      }

      order.paymentStatus = 'Success'; 
      await order.save();

      res.json({ success: true, message: 'Payment verified successfully' });
  } catch (error) {
      console.error('Error verifying Razorpay payment:', error);
      res.status(500).json({ error: 'Payment verification failed' });
  }
};

const returnOrder = async (req, res) => {
  try {
    const { orderId, reason } = req.body;
    const userId = req.session.user; 

    if (!orderId || !reason) {
      return res.status(400).json({ success: false, message: 'Order ID and reason are required' });
    }

    const order = await Order.findOne({ orderId, userId });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.status !== 'Delivered') {
      return res.status(400).json({ success: false, message: 'Only delivered orders can be returned' });
    }

    order.status = 'Return Request';
    order.returnReason = reason;
    await order.save();

    res.status(200).json({ success: true, message: 'Return request submitted successfully' });
  } catch (error) {
    console.error('Error processing return:', error);
    res.status(500).json({ success: false, message: 'An error occurred while processing the return request' });
  }
}; 


  
    module.exports = {
      loadCheckoutPage,
      loadOrderCompletedPage,
      placeOrder,
      orderDetails,
      cancelOrder,
      placeOrderOnline,
      verifyPayment,
      returnOrder,
    }