const Product = require("../../models/productSchema");
const Cart = require("../../models/cartSchema");
const Address = require("../../models/addressSchema");
const Order = require("../../models/orderSchema");
const { v4: uuidv4 } = require('uuid'); 




const loadCheckoutPage = async (req, res) => {
    try {
      const userId = req.session.user;
      const cart = await Cart.findOne({ userId }).populate("items.productId");

      if (!cart || cart.items.length === 0) {
        return res.render("checkout", { cart: [], totalAmount: subtotal, addresses: [] });
      }
  
      const totalAmount = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);
      console.log("this is cart items",cart.items)
      const userAddresses = await Address.findOne({ userId });
  
      res.render("checkout", {
        cart: cart.items, 
        totalAmount,
        addresses: userAddresses ? userAddresses.address : [], 
      });

    } catch (error) {
      console.error("Error loading checkout page:", error);
      res.status(500).send("An error occurred while loading the checkout page.");
    }
  };

  const placeOrder = async (req, res) => {
    try {
        const userId = req.session.user; 
        const { items, addressId, paymentMethod } = req.body; 

        if (!items || items.length === 0 || !addressId || !paymentMethod) {
            return res.status(400).json({ success: false, message: "Invalid order details" });
        }
  
        const cart = await Cart.findOne({ userId });
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
        const finalAmount = totalPrice; 
        const address = await Address.findOne({ userId, "address._id": addressId });

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
          orderId: uuidv4(),
          orderedItems: cart.items.map((item) => ({
          products: item.productId,
          size: item.size,
          quantity: item.quantity,
          price: item.totalPrice,
        })),
          address: selectedAddress,
          totalPrice,
          finalAmount,
          status: 'Pending',
         
        });
  
        await newOrder.save();
        cart.items = [];
        await cart.save();
  
        res.status(200).json({ 
          success: true, 
          message: "Order placed successfully!", 
          redirectUrl: "/order/success", 
          orderId: newOrder.orderId 
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
        res.render("orderdetails", {orders})

    } catch(error) {
      console.log(error)
    }
}
const cancelOrder = async (req, res) => {
  const { orderId, status } = req.body;

  try {
    const order = await Order.findOne({ orderId }).populate('orderedItems.products');
    console.log("This is the Oorders", order) // Populate product details
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update stock only if the order is being canceled
    if (status === 'Cancelled') {
       // Iterate through ordered items to return stock
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

    order.status = status; // Update the order status
    await order.save(); // Save the updated order

    res.status(200).json({ message: 'Order cancelled successfully, and stock updated' });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ message: 'Failed to cancel the order' });
  }
};


  
    module.exports = {
      loadCheckoutPage,
      loadOrderCompletedPage,
      placeOrder,
      orderDetails,
      cancelOrder
    }