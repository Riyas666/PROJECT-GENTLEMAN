const Product = require("../../models/productSchema");
const Cart = require("../../models/cartSchema");
const Coupon = require("../../models/couponSchema");
const statuscode = require("../../constants/statusCodes");
const responseMessage = require("../../constants/responseMessage");



const getCart = async (req, res) => {
  try {
    const userId = req.session.user;
    const cart = await Cart.findOne({ userId }).populate("items.productId")
    if (!cart) {
      return res.render('cart', { cartItems: [], total: 0 });
    }
    cart.items.forEach(item => {
      item.totalPrice = item.quantity * item.price;
    });
    
    const total = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);
    res.render('cart', { cartItems: cart.items, total });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(statuscode.INTERNAL_SERVER_ERROR).json({ 
      success: false, 
      message: responseMessage.SERVER_ERROR 
  });
  }
};

  const addToCartDetails = async (req, res, next) => {
   
    const { productId, size, quantity } = req.body;
    const userId = req.session.user;
    const maxQuantity = 5;
    if (!productId || !size || !quantity || quantity <= 0) {
      return res.status(statuscode.BAD_REQUEST).json({ 
        error: responseMessage.INVALID_INPUT 
      });
    }
  
    try {

      const product = await Product.findById(productId);
      if (!product) {
        return res.status(statuscode.NOT_FOUND).json({ 
          error: responseMessage.PRODUCT_NOT_FOUND 
        });
      }

      const sizeObject = product.sizes.find(item => item.size === size);
      const availableStock = sizeObject.quantity;

      if (availableStock < quantity) {
                  return res.status(statuscode.BAD_REQUEST).json({ 
                    success: false, 
                    message: responseMessage.NOT_ENOUGH_STOCK(size) 
                  });
               }

               if (quantity > maxQuantity) {
                     return res.status(statuscode.BAD_REQUEST).json({ 
                      success: false, 
                      message: responseMessage.MAX_QUANTITY_LIMIT(maxQuantity)
                    });
              }         

      let cart = await Cart.findOne({ userId });
      if (!cart) {

        const effectiveQuantity = Math.min(quantity, maxQuantity, availableStock);
         cart = new Cart({
                userId: userId,
                items: [{
                    productId: productId,
                    quantity: parseInt(quantity, 10),
                    size: size,
                    productName: product.productName,
                    productImage : product.productImage,
                    price: product.salePrice,
                    totalPrice:product.salePrice * effectiveQuantity,
                }],
            });
            await cart.save();
            return res.status(statuscode.OK).json({ 
              success: true, 
              message: responseMessage.ITEM_ADDED 
            });
        }


        if (Array.isArray(cart.items)) {

            const existingProduct = cart.items.find(item => item.productId.toString() == productId && item.size == size);

            if (existingProduct) {
                const newQuantity = existingProduct.quantity + quantity; 
                
                if (newQuantity > maxQuantity ) {
                    return res.status(statuscode.BAD_REQUEST).json({ 
                      success: false, 
                      message: responseMessage.MAX_QUANTITY_LIMIT(maxQuantity) 
                    });
                }
                if (newQuantity > availableStock) {
                    return res.status(statuscode.BAD_REQUEST).json({ 
                      success: false, 
                      message: responseMessage.NOT_ENOUGH_STOCK(size) 
                    });
                }

                existingProduct.quantity = newQuantity;
                existingProduct.totalPrice = existingProduct.price * existingProduct.quantity;

            } else {
                const allowedQuantity = Math.min(quantity, maxQuantity,availableStock);

                cart.items.push({
                    productId: productId,
                    size: size, 
                    productImage : product.productImage,
                    productName: product.productName,
          quantity: allowedQuantity,
          price: product.salePrice, 
          totalPrice: product.salePrice*allowedQuantity,
                });
            } 

            await cart.save(); 
            return res.status(statuscode.OK).json({ 
              success: true, 
              message: responseMessage.ITEM_ADDED
             });
        } else {
          res.status(statuscode.INTERNAL_SERVER_ERROR).json({ 
            success: false, 
            message: responseMessage.SERVER_ERROR 
        });
          
        }
      
      }catch (error) {
        next(error);
      } 
    
  }
     


  const updateCart = async (req, res) => {
    try {

      const { productId,size, quantity } = req.body;
      const userId = req.session.user;
      const cart = await Cart.findOne({ userId });
      if (!cart) {
        console.error("Cart not found for user:", userId);
        return res.status(statuscode.NOT_FOUND).json({ 
          success: false, 
          error: responseMessage.CART_NOT_FOUND 
        });
      }
  
      const cartItem = cart.items.find(item => item.productId.toString() === productId &&item.size==size);
      if (!cartItem) {
        console.error("Item not found in cart for product ID:", productId);
        return res.status(statuscode.NOT_FOUND).json({ 
          success: false, 
          error: responseMessage.ITEM_NOT_FOUND 
        });
      }

      const product = await Product.findById(productId);
      if (!product) {
        console.error("Product not found for ID:", productId);
        return res.status(statuscode.NOT_FOUND).json({ 
          success: false, 
          error: responseMessage.PRODUCT_NOT_FOUND 
        });
      }
  
      const sizeObject = product.sizes.find(item => item.size == cartItem.size);
      const availableStock = sizeObject?.quantity;
      const maxQuantity = 5;  
  
      if (quantity > maxQuantity) {
        console.error(`Requested quantity ${quantity} exceeds max limit of ${maxQuantity}`);
        return res.status(statuscode.BAD_REQUEST).json({ 
          success: false, 
          message: responseMessage.MAX_QUANTITY_LIMIT(maxQuantity) 
        });
      }
  
      if (quantity > availableStock) {
        console.error(`Requested quantity ${quantity} exceeds available stock of ${availableStock}`);
        return res.status(statuscode.BAD_REQUEST).json({ 
          success: false, 
          message: responseMessage.NOT_ENOUGH_STOCK(size) 
        });
      }
  
      cartItem.quantity = quantity;
      cartItem.totalPrice = cartItem.price * quantity;


      const totel = cart.items.reduce((acc,value)=>{
        return acc + value.totalPrice
      },0);

     
      await cart.save();
      console.log("Cart updated successfully:", cart);
      res.status(statuscode.OK).json({ 
        success: true, 
        totel, 
        cart: cart 
      });
    } catch (error) {
      console.error("Error updating cart:", error);
      res.status(statuscode.INTERNAL_SERVER_ERROR).json({ 
        success: false, 
        message: responseMessage.SERVER_ERROR 
    });
    }
  };


  const deleteCartItem = async (req, res) => {
    try {
        const { productId, size } = req.body; 

        const updatedCart = await Cart.findOneAndUpdate(
            { userId: req.session.user },
            { $pull: { items: { productId, size } } }, 
            { new: true }
        );

        if (!updatedCart) {
            return res.status(statuscode.NOT_FOUND).json({ 
              success: false, 
              error: responseMessage.CART_ITEM_NOT_FOUND 
            });
        }

        res.status(statuscode.OK).json({ 
          success: true, 
          cart: updatedCart 
        });
    } catch (error) {
        console.error("Error deleting cart item:", error);
        res.status(statuscode.INTERNAL_SERVER_ERROR).json({ 
          success: false, 
          message: responseMessage.SERVER_ERROR 
      });
    }
};

const applyCoupon = async (req, res) => {

  try {

    const { couponId, discountAmount, finalAmount } = req.body;
    const userId = req.session.user;
    const coupon = await Coupon.findById(couponId);
    
    
    if (!coupon) {
      return res.status(statuscode.BAD_REQUEST).json({
        success: false, 
        message: responseMessage.INVALID_COUPON 
      });
    }

    req.session.coupon = { couponId, discountAmount, finalAmount };

    return res.json({ 
      success: true,
      message: responseMessage.COUPON_APPLIED, 
      discountAmount,
      finalAmount
    });
  } catch (error) {
    console.error('Error applying coupon:', error);
    res.status(statuscode.INTERNAL_SERVER_ERROR).json({ 
      success: false, 
      message: responseMessage.SERVER_ERROR 
  });
  }
};

const checkStockAvailability = async(req,res) =>{
  try{
    const userId = req.session.user
    const cart = await Cart.findOne({userId}).populate('items.productId')
    let outOfStockItems = [];
    for(const item of cart.items){
      const sizeObj = item.productId.sizes.find(
        (size) => size.size == item.size
      );

      if (sizeObj.quantity < item.quantity) {
        outOfStockItems.push(`The product ${item.productId.productName} in size ${item.size} has not enough items in stock.`);
      }
    }

    if(outOfStockItems.length>0){
      return res.json({
        success:false,
        message:outOfStockItems
      })
    }
    return res.json({ success: true });
  }catch(error){
console.error("error")
  }
}

  module.exports = {
    getCart,
    addToCartDetails,
    updateCart,
    deleteCartItem,
    applyCoupon,
    checkStockAvailability
  }