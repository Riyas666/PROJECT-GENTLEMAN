const Product = require("../../models/productSchema");
const Cart = require("../../models/cartSchema");
const Address = require("../../models/addressSchema");
const Order = require("../../models/orderSchema");
const Coupon = require("../../models/couponSchema")
const User = require("../../models/userSchema");
const Razorpay  = require("razorpay")
const crypto = require('crypto');
const generateOrderId = require("../../utils/generateorderid");
const statuscode = require("../../constants/statusCodes");
const responseMessage = require("../../constants/responseMessage");



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
      res.status(statuscode.INTERNAL_SERVER_ERROR).json({ 
        success: false, 
        message: responseMessage.SERVER_ERROR 
    });
    }
  };

  const placeOrder = async (req, res) => {
    try {

      const coupons = req.session.coupon;
      const userId = req.session.user; 
      const { addressId, paymentMethod , offerdiscount} = req.body; 

        if (!addressId || !paymentMethod) {
            return res.status(statuscode.BAD_REQUEST).json({ 
              success: false, 
              message: responseMessage.INVALID_ORDER_DETAILS 
            });
        }  

      const discount = offerdiscount + coupons?coupons.discountAmount : 0;
      const cart = await Cart.findOne({ userId })
        if (!cart || cart.items.length === 0) {
            return res.status(statuscode.NOT_FOUND).json({ 
              success: false, 
              message: responseMessage.CART_EMPTY 
            });
        }

        const productIds = cart.items.map((item) => item.productId);
        const products = await Product.find({ _id: { $in: productIds } });
        for (const item of cart.items) {
            const product = products.find((prod) => prod._id.toString() == item.productId.toString());
            if (!product) {
                return res.status(statuscode.NOT_FOUND).json({ 
                  success: false, 
                  message: `${responseMessage.PRODUCT_NOT_FOUND} (ID: ${item.productId})` 
                });
            }

            const sizeObject = product.sizes.find((sizes) => sizes.size == item.size);
            if (!sizeObject || sizeObject.quantity < item.quantity) {
                return res.status(statuscode.BAD_REQUEST).json({
                    success: false,
                    message:  responseMessage.STOCK_NOT_AVAILABLE(product.productName, item.size),
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
            return res.status(statuscode.NOT_FOUND).json({ 
              success: false, 
              message: responseMessage.ADDRESS_NOT_FOUND 
            });
        }
        const selectedAddress = address.address.find(addr => addr._id == addressId);

        if (!selectedAddress) {
          return res.status(statuscode.NOT_FOUND).json({ 
            success: false, 
            message: responseMessage.ADDRESS_NOT_FOUND
          });
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
            if(finalAmount>1000){
              return res.status(statuscode.BAD_REQUEST).json({
                success: false,
                message: responseMessage.COD_LIMIT
              })
            }

            await newOrder.save();
            break;
          case 'Wallet':
            const user = await User.findById(userId);
            if(user.wallet.balance< finalAmount){
              return res.status(statuscode.BAD_REQUEST).json({
                success: false,
                message: responseMessage.WALLET_INSUFFICIENT
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
            return res.status(statuscode.BAD_REQUEST).json({
              success:false,
              message:'Invalid payment method'
            })
        }
  
        cart.items = [];
        await cart.save();
  
        res.status(statuscode.OK).json({ 
          success: true, 
          message: responseMessage.ORDER_PLACED, 
          redirectUrl: "/order/success", 
          orderId: newOrder.orderId ,
          amount: finalAmount * 100,
      });
    } catch (error) {
        console.error("Error placing order:", error);
        res.status(statuscode.INTERNAL_SERVER_ERROR).json({ 
          success: false, 
          message: responseMessage.SERVER_ERROR 
      });
    }
  };

  
const placeOrderOnline = async (req, res) => {
  try {
    const coupons = req.session.coupon;
    const userId = req.session.user; 
    const {  addressId,  paymentMethod } = req.body;
    const cart = await Cart.findOne({userId})
    if (!cart || cart.items.length === 0) {
      return res.status(statuscode.NOT_FOUND).json({ 
        success: false, 
        message: responseMessage.CART_EMPTY 
      });
    }

    const productIds = cart.items.map((item) => item.productId);
    const products = await Product.find({ _id: { $in: productIds } });

    for (const item of cart.items) {
      const product = products.find((prod) => prod._id.toString() === item.productId.toString());
      if (!product) {
        return res.status(statuscode.NOT_FOUND).json({ 
          success: false, 
          message: `${responseMessage.PRODUCT_NOT_FOUND} (ID: ${item.productId})` 
        });
      }
      const sizeObject = product.sizes.find((sizes) => sizes.size == item.size);
    
              if (!sizeObject || sizeObject.quantity < item.quantity) {
                return res.status(statuscode.BAD_REQUEST).json({
                  success: false,
                  message:  responseMessage.STOCK_NOT_AVAILABLE(product.productName, item.size),
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
        const options = {
        amount: coupons?coupons.finalAmount*100:finalAmount*100, 
        currency: 'INR',
        receipt: `order_rcptid_${Math.floor(Math.random() * 10000)}`,
      };

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

      res.json({ success: true, razorpayOrder });    
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(statuscode.INTERNAL_SERVER_ERROR).json({ 
      success: false, 
      message: responseMessage.SERVER_ERROR 
  });
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

      if (!isValidSignature) {
          return res.status(statuscode.BAD_REQUEST).json({ 
            error: responseMessage.PAYMENT_FAILED 
          });
      }

      const order = await Order.findOne({ orderId: orderId });
      if (!order) {
          return res.status(statuscode.NOT_FOUND).json({ 
            error: responseMessage.ORDER_NOT_FOUND 
          });
      }

      order.paymentStatus = 'Success'; 
      await order.save();

      res.json({ 
        success: true, 
        message: responseMessage.PAYMENT_SUCCESS 
      });
  } catch (error) {
      console.error('Error verifying Razorpay payment:', error);
      res.status(statuscode.INTERNAL_SERVER_ERROR).json({ 
        success: false, 
        message: responseMessage.SERVER_ERROR 
    });
  }
};







  const loadOrderCompletedPage = async (req, res) => {
    try {
      res.render("orderplacedsuccessfully", {
        success: true,
      });
    } catch (error) {
      console.error("Error loading order completion page:", error);
      res.status(statuscode.INTERNAL_SERVER_ERROR).render("orderplacedsuccessfully", {
        success: false,
        message: responseMessage.SERVER_ERROR
      });
    }
  };
    

const orderDetails = async(req,res)=>{
    const userId = req.session.user;
    const id = req.params.id;

    try{

        const user = User.find({userId})
        const orders = await Order.findById(id).populate("orderedItems.products").populate("address")
        const estimatedDeliveryDate = new Date(orders.createdAt);
        estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 2);
        res.render("orderdetails", {
          orders,
          user, 
          estimatedDeliveryDate
        })

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
      return res.status(statuscode.NOT_FOUND).json({ 
        success: false,
        message: responseMessage.ORDER_NOT_FOUND 
      });
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

      } else {
        return res.status(statuscode.NOT_FOUND).json({ 
          success: false,
          message: responseMessage.USER_NOT_FOUND 
        });
      }
    }

    if (status === 'Cancelled') {
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
      }
    }
  }

    order.status = status;
    order.cancelReason = reason

    await order.save(); 

    res.status(statuscode.OK).json({ 
      success: true,
      message: responseMessage.ORDER_CANCELLED 
    });

  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(statuscode.INTERNAL_SERVER_ERROR).json({ 
      success: false, 
      message: responseMessage.SERVER_ERROR 
   });
  }
};


const returnOrder = async (req, res) => {
  try {
    const { orderId, reason } = req.body;
    const userId = req.session.user; 

    if (!orderId || !reason) {
      return res.status(statuscode.BAD_REQUEST).json({ 
        success: false, 
        message: 'Order ID and reason are required' 
      });
    }

    const order = await Order.findOne({ orderId, userId });
    if (!order) {
      return res.status(statuscode.NOT_FOUND).json({
         success: false, 
         message: responseMessage.ORDER_NOT_FOUND 
        });
    }

    if (order.status !== 'Delivered') {
      return res.status(statuscode.BAD_REQUEST).json({
         success: false, 
         message: 'Only delivered orders can be returned' 
        });
    }

    order.status = 'Return Request';
    order.returnReason = reason;
    await order.save();

    res.status(statuscode.OK).json({
       success: true, 
       message: responseMessage.RETURN_REQUEST_SUCCESS 
      });
  } catch (error) {
    console.error('Error processing return:', error);
    res.status(statuscode.INTERNAL_SERVER_ERROR).json({ 
      success: false, 
      message: responseMessage.SERVER_ERROR 
    });
  }
}; 

const retryPayment = async (req, res) => {
  const { orderId } = req.body;
  try {
      const orderDetails = await Order.findOne({ orderId: orderId });

      if (!orderDetails) {
          return res.status(statuscode.NOT_FOUND).json({ 
            success: false, 
            message: responseMessage.ORDER_NOT_FOUND 
          });
      }

      const options = {
          amount: orderDetails.finalAmount * 100,
          currency: "INR",
          receipt: `order_rcptid_${orderDetails.orderId}`,
      };

      const razorpayOrder = await razorpayInstance.orders.create(options);

      orderDetails.orderId = razorpayOrder.id;

      await orderDetails.save()
      res.json({ success: true, razorpayOrder, amount: options.amount });  

  } catch (error) {
      console.error("Error creating Razorpay order:", error);
      res.status(statuscode.INTERNAL_SERVER_ERROR).json({ 
        success: false, 
        message: responseMessage.SERVER_ERROR 
    });
  }
};

const verifyRetryPayment = async (req, res) => {
  try {
      const { paymentId, orderId, signature } = req.body;

      const generatedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
          .update(`${orderId}|${paymentId}`)
          .digest('hex');

      if (generatedSignature !== signature) {
          return res.status(statuscode.BAD_REQUEST).json({ 
            error: responseMessage.RETRY_PAYMENT_fAILED 
          });
      }

      const order = await Order.findOne({ orderId: orderId });
      if (!order) {
          return res.status(statuscode.NOT_FOUND).json({ 
            error: responseMessage.ORDER_NOT_FOUND
          });
      }

      order.paymentStatus = "Success";
      await order.save();
      res.status(statuscode.OK).json({ 
        success: true, 
        message: responseMessage.RETRY_PAYMENT_SUCCESS 
      });

  } catch (error) {
      console.error(" Error verifying retry payment:", error);
      res.status(statuscode.INTERNAL_SERVER_ERROR).json({ 
        success: false, 
        message: responseMessage.SERVER_ERROR 
    });
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
      retryPayment,
      verifyRetryPayment
    }