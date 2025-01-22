const Product = require("../../models/productSchema");
const Category = require("../../models/categorySchema");
const User = require("../../models/categorySchema");
const Cart = require("../../models/cartSchema");








const getCart = async (req, res) => {
    try {
      const userId = req.session.user;
  
      // Find the user's cart and populate product details
      const cart = await Cart.findOne({ userId }).populate('items.productId');
  
      if (!cart) {
        return res.render('cart', { cartItems: [], total: 0 });
      }
  
      // Calculate total price
      const total = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);
  
      res.render('cart', { cartItems: cart.items, total });
    } catch (error) {
      console.error('Error fetching cart:', error);
      res.status(500).send('Error fetching cart');
    }
  };


  const addToCart = async (req, res) => {
    try {
      const userId = req.session.user;
      const productId = req.query.id;
  
      const product = await Product.findById(productId);
      if (!product) return res.status(404).send('Product not found');
  
      const maxQuantity = 5;
      // Find or create the user's cart
      let cart = await Cart.findOne({ userId });
      if (!cart) cart = new Cart({ userId, items: [] });
  
      // Check if product already exists in the cart
      const existingItem = cart.items.find(item => item.productId.toString() === productId);
  
      if (existingItem) {
        if (existingItem.quantity >= maxQuantity) {
          return res.status(400).send('Maximum quantity reached');
        }
        existingItem.quantity += 1;
        existingItem.totalPrice = existingItem.quantity * product.salePrice;
      } else {
        cart.items.push({
          productId: product._id,
          quantity: 1,
          price: product.salePrice,
          totalPrice: product.salePrice,
        });
      }
  
      await cart.save();
      res.redirect('/cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      res.status(500).send('Error adding item to cart');
    }
  };
  
  

  
  const addToCartDetails = async (req, res) => {
    const { productId, size, quantity } = req.body;
    console.log("This is the product id", size);
    const userId = req.session.user;
    console.log("")
  
    // Validate input
    if (!productId || !size || !quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Invalid product, size, or quantity' });
    }
  
    try {
      // Fetch the product details
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
  
      const maxQuantity = 5; // Define maximum quantity allowed per size
  
      // Find or create the user's cart
      let cart = await Cart.findOne({ userId });
      if (!cart) {
        cart = new Cart({ userId, items: [] });
      }
  
      // Check if the product with the specified size is already in the cart
      const existingProductIndex = cart.items.findIndex(
        item => item.productId.toString() === productId && item.size === size
      );

  
      if (existingProductIndex >= 0) {
        // If the product with the size exists, check the total quantity
        const existingProduct = cart.items[existingProductIndex];
        const newTotalQuantity = existingProduct.quantity + parseInt(quantity, 10);
  
        if (newTotalQuantity > maxQuantity) {
          return res.status(400).json({ error: `Maximum limit of ${maxQuantity} items for size ${size} reached` });
        }
  
        // Update the product quantity and total price
        existingProduct.quantity = newTotalQuantity;
        existingProduct.totalPrice = newTotalQuantity * existingProduct.price;
      } else {
        // If the product with the size is not in the cart, check if the requested quantity exceeds the limit
        if (quantity > maxQuantity) {
          return res.status(400).json({ error: `Maximum limit of ${maxQuantity} items for size ${size} reached` });
        }
  
        // Add the new product with the size to the cart
        const totalPrice = product.salePrice * parseInt(quantity, 10);
        cart.items.push({
          productId: productId,
          size: size, 
          quantity: parseInt(quantity, 10),
          price: product.salePrice, // Sale price or regular price
          totalPrice: totalPrice,
        });
      }
      console.log("Cart items before save: ", cart.items);
  
      // Save the cart
      await cart.save();


  
      return res.json({ message: 'Item added to cart successfully!', cart });
    } catch (error) {
      console.error('Error adding to cart:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  



  const updateCart = async (req, res) => {
    try {
      const { productId, quantity } = req.body;
      const userId = req.session.user;
  
      const maxQuantity = 5;
      if (quantity <= 0) return res.status(400).json({ error: 'Invalid quantity' });
        if (quantity > maxQuantity) return res.status(400).json({ error: 'Maximum quantity reached' });
  
      const cart = await Cart.findOne({ userId });
      if (!cart) return res.status(404).json({ error: 'Cart not found' });
  
      const item = cart.items.find(item => item.productId.toString() === productId);
      if (!item) return res.status(404).json({ error: 'Product not in cart' });
  
      item.quantity = quantity;
      item.totalPrice = quantity * item.price;
  
      await cart.save();
      res.json({ success: true, message: 'Cart updated', cart });
    } catch (error) {
      console.error('Error updating cart:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };


  module.exports = {
    getCart,
    addToCart,
    addToCartDetails,
    updateCart
  }