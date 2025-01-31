const Product = require("../../models/productSchema");
const Cart = require("../../models/cartSchema");
const User = require("../../models/userSchema")


const getCart = async (req, res) => {
  try {
    const userId = req.session.user;
    const cart = await Cart.findOne({ userId }).populate('items.productId');

    if (!cart) {
      return res.render('cart', { cartItems: [], total: 0 });
    }

    // Ensure total price is being calculated correctly on each item
    cart.items.forEach(item => {
      item.totalPrice = item.quantity * item.productId.price;
    });

    const total = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);
    res.render('cart', { cartItems: cart.items, total });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).send('Error fetching cart');
  }
};

  
  

  const addToCartDetails = async (req, res, next) => {
    const { productId, size, quantity } = req.body;
    console.log("This is the product id", size);
    const userId = req.session.user;

    const maxQuantity = 5;
  
    if (!productId || !size || !quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Invalid product, size, or quantity' });
    }
  
    try {

      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      

      const sizeObject = product.sizes.find(item => item.size === size);
      const availableStock = sizeObject.quantity;

      if (availableStock < quantity) {
                  return res.status(400).json({ success: false, message: `Not enough stock for size ${size}` });
               }

               if (quantity > maxQuantity) {
                     return res.status(400).json({ success: false, message:` You can only add up to ${maxQuantity} of this item. `});
                       }         

      let cart = await Cart.findOne({ userId });

      if (!cart) {

        const effectiveQuantity = Math.min(quantity, maxQuantity, availableStock);
        console.log("This is the effective quantity", effectiveQuantity);

         cart = new Cart({
                userId: userId,
                items: [{
                    productId: productId,
                    quantity: parseInt(quantity, 10),
                    size: size,
                    productName: product.productName,
                    price: product.salePrice,
                    totalPrice:product.salePrice * effectiveQuantity,
                }],
                
            });
           
            await cart.save();
            console.log("This is the cart", cart);
            return res.status(200).json({ success: true, message: 'Item added to cart successfully!' });
        }
        if (Array.isArray(cart.items)) {
          console.log("This is the cart items", cart.items);

            const existingProduct = cart.items.find(item => item.productId.toString() == productId && item.size == size);

            if (existingProduct) {
                const newQuantity = existingProduct.quantity + quantity; 
console.log("this is the existinggggggggg existing product", existingProduct);
                
                if (newQuantity > maxQuantity ) {
                    return res.status(400).json({ success: false, message:` You can only add up to ${maxQuantity} of this item.` });
                }
                if (newQuantity > availableStock) {
                    return res.status(400).json({ success: false, message: 'Not enough stock available for this size' });
                }
                existingProduct.quantity = newQuantity;
              
                existingProduct.totalPrice = existingProduct.price * existingProduct.quantity; 
            } else {
                const allowedQuantity = Math.min(quantity, maxQuantity,availableStock);

                cart.items.push({
                    productId: productId,
                    size: size, 
          quantity: allowedQuantity,
          price: product.salePrice, 
          totalPrice: product.salePrice*allowedQuantity,
                    
                });
            } 
            await cart.save(); 
            return res.status(200).json({ success: true, message: `Item added to cart successfully!` });
        } else {
            return res.status(500).json({ success: false,message: 'Error occured',
            });
        }
    } catch (error) {
        next(error);
      } 
  };

  const updateCart = async (req, res) => {
    try {
      const { productId, quantity } = req.body;
      const userId = req.session.user;
  
      // Find the user's cart
      const cart = await Cart.findOne({ userId });
      if (!cart) {
        console.error("Cart not found for user:", userId);
        return res.status(404).json({ success: false, error: 'Cart not found' });
      }
  
      // Find the specific cart item to update
      const cartItem = cart.items.find(item => item.productId.toString() === productId);
      if (!cartItem) {
        console.error("Item not found in cart for product ID:", productId);
        return res.status(404).json({ success: false, error: 'Item not found in cart' });
      }
  
      // Fetch product details
      const product = await Product.findById(productId);
      if (!product) {
        console.error("Product not found for ID:", productId);
        return res.status(404).json({ success: false, error: 'Product not found' });
      }
  
      const sizeObject = product.sizes.find(item => item.size === cartItem.size);
      const availableStock = sizeObject?.quantity;
      const maxQuantity = 5; // Max limit
  
      // Check if the requested quantity exceeds max allowed
      if (quantity > maxQuantity) {
        console.error(`Requested quantity ${quantity} exceeds max limit of ${maxQuantity}`);
        return res.status(400).json({ success: false, message: `You can only add up to ${maxQuantity} items of this product.` });
      }
  
      // Check if there's enough stock available
      if (quantity > availableStock) {
        console.error(`Requested quantity ${quantity} exceeds available stock of ${availableStock}`);
        return res.status(400).json({ success: false, message: `Not enough stock available. Only ${availableStock} items available for this size.` });
      }
  
      // Update the cart item quantity and total price
      cartItem.quantity = quantity;
      cartItem.totalPrice = cartItem.price * quantity;
  
      // Save updated cart
      await cart.save();
      console.log("Cart updated successfully:", cart);
  
      res.json({ success: true, cart: cart });
    } catch (error) {
      console.error("Error updating cart:", error);
      res.status(500).json({ success: false, error: 'Failed to update cart' });
    }
  };
  
  
      const deleteCartItem = async (req, res) => {
        try {
          const { productId } = req.body;
      
          // Remove the product from the cart
          const updatedCart = await Cart.findOneAndUpdate(
            { userId: req.session.user },
            { $pull: { items: { productId } } },
            { new: true }
          );
      
          if (!updatedCart) {
            return res.status(404).json({ success: false, error: 'Cart item not found' });
          }
      
          res.json({ success: true, cart: updatedCart });
        } catch (error) {
          console.error('Error deleting cart item:', error);
          res.status(500).json({ success: false, error: 'Internal server error' });
        }
      };
      
const getWishlist = async(req,res)=>{
  try{
    const userId = req.session.user;
    const user = await User.findById(userId).populate("wishlist.productId");
  console.log("heheheh", user)
    res.render("wishlist", {
      user,
      wishlist:user.wishlist,
    })
  }catch(error){
   console.error(error)
   res.redirect("/pageNotFound")
  }
  
}

const addToWishlist = async(req,res)=>{
  try{
    const {productId,size} = req.body;
    const userId = req.session.user;
                                               
    if (!productId) {
      return res.status(400).json({ status: false, message: "Product ID is required" });
    }

    const user = await User.findById(userId) 

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ status: false, message: "Product not found" });
    }


  let selectedSize;
    if (size) {
      // If the user has selected a size, use that
      selectedSize = size;
    } else {
      // If no size is selected (shop page), use the first available size as default
      selectedSize = product.sizes.length > 0 ? product.sizes[0].size : null;
    }



    if (!selectedSize) {
      return res.status(400).json({ status: false, message: "No valid size available for this product" });
    }

    if (user.wishlist?.some((item) => item.productId?.toString() === productId &&item.size===selectedSize)) {
      return res.status(200).json({ status: false, message: "Product already in wishlist" });
    }
    
    const sizeObject = product.sizes.find((item) => item.size === selectedSize);
    if (!sizeObject) {
      return res.status(400).json({ status: false, message: "Invalid size selected" });
    }
    
    const stockStatus = sizeObject.quantity > 0 ? 'In Stock' : 'Out of Stock';
    
console.log("44444444444", stockStatus)
   

   
    user.wishlist.push ({
      name:product.productName,
      price:product.salePrice,
      productId, 
      size: selectedSize, 
      stockStatus 
    })
    await user.save()
    res.status(200).json({ status: true, message: "Product added to wishlist" });

  }catch(error){
    console.error(error);

    res.status(500).json({ status: false, message: "Internal server error" });
  }
}


const deleteWishlistItem = async (req, res) => {
  try {
    const { productId } = req.body; // Get the productId from the request body
    const userId = req.session.user; // Get the userId from the session

    if (!productId) {
      return res.status(400).json({ success: false, message: "Product ID is required" });
    }

    // Find the user and remove the item from the wishlist
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $pull: { wishlist: { productId } } }, // Remove the product with the specified ID
      { new: true } // Return the updated document
    ).populate("wishlist.productId"); // Optionally repopulate the wishlist for response

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Item removed from wishlist successfully",
      wishlist: updatedUser.wishlist, // Optionally send the updated wishlist back
    });
  } catch (error) {
    console.error("Error deleting wishlist item:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


const removeFromWishlist = async (req, res) => {
  try {
      const { productId } = req.body;
      const userId = req.session.user; // Assuming session stores the logged-in user's ID

      if (!userId) {
          return res.status(401).json({ success: false, message: "User not authenticated" });
      }

      // Find the user and update their wishlist by removing the product
      const updatedUser = await User.findByIdAndUpdate(
          userId,
          { $pull: { wishlist: { productId: productId } } },
          { new: true }
      );

      if (!updatedUser) {
          return res.status(404).json({ success: false, message: "User not found" });
      }

      return res.json({ success: true, message: "Item removed from wishlist" });

  } catch (error) {
      console.error("Error removing from wishlist:", error);
      return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


const applyCoupon = async (req, res) => {
  try {
    const { couponId, discountAmount, finalAmount } = req.body;
    const userId = req.session.user;

    // Find the coupon
    const coupon = await Coupon.findById(couponId);
    
    if (!coupon) {
      return res.status(400).json({ message: 'Invalid coupon.' });
    }

    // You can save the coupon details and the new totalAmount in the session or cart
    // Example: Save it in session for later use
    req.session.coupon = { couponId, discountAmount, finalAmount };

    res.json({ success: true, message: 'Coupon applied successfully', discountAmount, finalAmount });
  } catch (error) {
    console.error('Error applying coupon:', error);
    res.status(500).json({ message: 'An error occurred while applying the coupon.' });
  }
};




  module.exports = {
    getCart,
    addToCartDetails,
    updateCart,
    deleteCartItem,
    getWishlist,
    addToWishlist,
    deleteWishlistItem,
    removeFromWishlist,
    applyCoupon
  }