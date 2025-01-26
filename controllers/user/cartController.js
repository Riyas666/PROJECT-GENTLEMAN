const Product = require("../../models/productSchema");
const Cart = require("../../models/cartSchema");


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
      

      


  module.exports = {
    getCart,
    addToCartDetails,
    updateCart,
    deleteCartItem
  }