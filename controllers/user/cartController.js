const Product = require("../../models/productSchema");
const Category = require("../../models/categorySchema");
const User = require("../../models/categorySchema");
const Cart = require("../../models/cartSchema");
const Address = require("../../models/addressSchema");








const getCart = async (req, res) => {
    try {
      const userId = req.session.user;
  

      const cart = await Cart.findOne({ userId }).populate('items.productId');
  
      if (!cart) {
        return res.render('cart', { cartItems: [], total: 0 });
      }
  
      
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

      let cart = await Cart.findOne({ userId });
      if (!cart) cart = new Cart({ userId, items: [] });
  

      const existingItem = cart.items.find(item => item.productId.toString() === productId);

      console.log("This is the existing item", existingItem);
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
          size: size, 
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
                // cartSubtotal: product.regularPrice * effectiveQuantity, 
                // totalOffer: totalOfferForProduct,
                // cartTotal: product.salePrice * effectiveQuantity 
            });
            console.log("This is the cart", cart);
  
            
       
            await cart.save();
            return res.status(200).json({ success: true, message: 'Item added to cart successfully!' });
        }
        if (Array.isArray(cart.items)) {
          console.log("This is the cart items", cart.items);

          
            const existingProduct = cart.items.find(item => item.productId.toString() == productId && item.size == size);

console.log("This is the existing product", existingProduct);


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
          totalPrice: product.salePrice*quantity,
                    
                });
            } 
            await cart.save(); 
            return res.status(200).json({ success: true, message: 'Item added to cart successfully!' });
        } else {
            return res.status(500).json({ success: false, message: 'Cart products are not available' });
        }
    } catch (error) {
        next(error);
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











  // const addToCart = async (req, res,next) => {
  //   try {
  //       const { productId,quantity,size } = req.body;
  //       const userId = req.session.user
  //       const CART_LIMIT = 5;
  
  //       if (!userId) {
  //           return res.status(401).json({ success: false, message: 'User not authenticated' });
  //       }
  //       const product = await Product.findById(productId);
  //       if (!product) {
  //           return res.status(404).json({ success: false, message: 'Product not found' });
  //       }
       
  //       const sizeObject = product.sizes.find(item => item.size === size);
        
  //       const availableStock = sizeObject.quantity;
        
  //       if (availableStock < quantity) {
  //           return res.status(400).json({ success: false, message: Not enough stock for size ${size} });
  //       }
  
  //       if (quantity > CART_LIMIT) {
  //         return res.status(400).json({ success: false, message: You can only add up to ${CART_LIMIT} of this item. });
  //       }
  
  
  //       const productImage = product.productImage && product.productImage.length > 0 ? product.productImage[0] : null;
  //       if (!productImage) {
  //           return res.status(400).json({ success: false, message: 'Product image not available' });
  //       }
  //       let cart = await Cart.findOne({ userId: userId });
       
  //       if (!cart) {
  //           const effectiveQuantity = Math.min(quantity, CART_LIMIT, availableStock);
  //           const discountPerUnit = product.regularPrice - product.salePrice;
  //           const totalOfferForProduct = discountPerUnit * effectiveQuantity;
        
  //           cart = new Cart({
  //               userId: userId,
  //               items: [{
  //                   productId: productId,
  //                   quantity: effectiveQuantity,
  //                   size: size,
  //                   productName: product.productName,
  //                   salePrice: product.salePrice,
  //                   regularPrice: product.regularPrice,
  //                   productImage: product.productImage[0],
  //                   totalPrice: product.regularPrice * effectiveQuantity,
  //                   productOffer: discountPerUnit
  //               }],
  //               cartSubtotal: product.regularPrice * effectiveQuantity, 
  //               totalOffer: totalOfferForProduct,
  //               cartTotal: product.salePrice * effectiveQuantity 
  //           });
  
            
       
  //           await cart.save();
  //           return res.status(200).json({ success: true, message: 'Item added to cart successfully!' });
  //       }
  //       if (Array.isArray(cart.items)) {
  //           const existingProduct = cart.items.find(item => item.productId.toString() === productId && item.size === size);
  //           if (existingProduct) {
  //               const newQuantity = existingProduct.quantity + quantity; 
  //               if (newQuantity > CART_LIMIT ) {
  //                   return res.status(400).json({ success: false, message: You can only add up to ${CART_LIMIT} of this item. });
  //               }
  //               if (newQuantity > availableStock) {
  //                   return res.status(400).json({ success: false, message: 'Not enough stock available for this size' });
  //               }
  //               existingProduct.quantity = newQuantity;
  //               existingProduct.totalPrice = existingProduct.salePrice * existingProduct.quantity; 
  //           } else {
  //               const allowedQuantity = Math.min(quantity, CART_LIMIT,availableStock);
  //               cart.items.push({
  //                   productId: productId,
  //                   quantity: allowedQuantity,
  //                   size: size,
  //                   productName:product.productName,  
  //                   salePrice:product.salePrice,
  //                   regularPrice:product.regularPrice, 
  //                   productImage:product.productImage[0],
  //                   totalPrice:product.salePrice*quantity,
  //                   productOffer:product.regularPrice-product.salePrice,
                    
  //               });
  //           } 
  
  //       const cartSubtotal = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);
  //       cart.totalOffer=product.regularPrice-product.salePrice
  //       cart.cartSubtotal = cartSubtotal;
  //       cart.cartTotal = cartSubtotal; 
  
  //           await cart.save(); 
  //           return res.status(200).json({ success: true, message: 'Item added to cart successfully!' });
  //       } else {
  //           return res.status(500).json({ success: false, message: 'Cart products are not available' });
  //       }
  //   } catch (error) {
  //       // console.error('Error:', error);
  //       // return res.status(500).json({ success: false, message: 'An error occurred while adding the item to the cart' });
  //       next(error);
  //     } 
  // };












// Load Checkout Page
const loadCheckoutPage = async (req, res) => {
  try {
    const userId = req.session.user;

    // Fetch cart
    const cart = await Cart.findOne({ userId }).populate("items.productId");
    if (!cart || cart.items.length === 0) {
      return res.render("checkout", { cart: [], totalAmount: 0, addresses: [] });
    }

    const totalAmount = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);
    console.log("this is cart items",cart.items)

    
   
    // Fetch addresses
    const userAddresses = await Address.findOne({ userId });


    res.render("checkout", {
      cart: cart.items, 
      totalAmount,
      addresses: userAddresses ? userAddresses.address : [], // Pass the addresses to the template
    });
  } catch (error) {
    console.error("Error loading checkout page:", error);
    res.status(500).send("An error occurred while loading the checkout page.");
  }
};









  module.exports = {
    getCart,
    addToCart,
    addToCartDetails,
    updateCart,
    loadCheckoutPage
   
  }