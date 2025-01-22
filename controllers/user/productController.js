const Product = require("../../models/productSchema");
const Category = require("../../models/categorySchema");
const User = require("../../models/categorySchema");
const Cart = require("../../models/cartSchema");

const productDetails = async (req, res) => {
    try {
        const userId = req.session.user;
        const userData = await User.findById(userId);
        const productId = req.query.id;
        const product = await Product.findById(productId).populate("category").populate("brand");
        const findCategory = product.category;
        const categoryOffer = findCategory?.categoryOffer || 0;
        const productOffer = product.productOffer || 0;
        const totalOffer = categoryOffer + productOffer;

        res.render("product-details", {
            user: userData,
            product: product,
            sizes: product.sizes,
            totalOffer: totalOffer,
            brand: product.brand,
            category: product.category,
            
        });
        console.log("this is the brand name", product.sizes);
    } catch (error) {
        console.error("Error for fetching product details", error);
        res.redirect("/pageNotFound");
    }
};
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







  // const addToCartDetails = async (req, res) => {
  //   const { productId, quantity } = req.body;
  //   const userId = req.session.user;
  
  //   // Check if the productId and quantity are valid
  //   if (!productId || !quantity || quantity <= 0) {
  //     return res.status(400).json({ error: 'Invalid product or quantity' });
  //   }
  
  //   try {
  //     // Fetch the product details
  //     const product = await Product.findById(productId);
  //     if (!product) {
  //       return res.status(404).json({ error: 'Product not found' });
  //     }
  
  //     const maxQuantity = 5; // Define maximum quantity allowed per product
  
  //     // Find or create the user's cart
  //     let cart = await Cart.findOne({ userId });
  //     if (!cart) {
  //       cart = new Cart({ userId, items: [] });
  //     }
  
  //     // Check if the product is already in the cart
  //     const existingProductIndex = cart.items.findIndex(item => item.productId.toString() === productId);
  
  //     if (existingProductIndex >= 0) {
  //       // If the product exists, check the total quantity
  //       const existingProduct = cart.items[existingProductIndex];
  //       const newTotalQuantity = existingProduct.quantity + parseInt(quantity, 10);
  
  //       if (newTotalQuantity > maxQuantity) {
  //         return res.status(400).json({ error: `Maximum limit of ${maxQuantity} items per product reached` });
  //       }
  
  //       // Update the product quantity and total price
  //       existingProduct.quantity = newTotalQuantity;
  //       existingProduct.totalPrice = newTotalQuantity * existingProduct.price;
  //     } else {
  //       // If the product is not in the cart, check if the requested quantity exceeds the limit
  //       if (quantity > maxQuantity) {
  //         return res.status(400).json({ error: `Maximum limit of ${maxQuantity} items per product reached` });
  //       }
  
  //       // Add the new product to the cart
  //       const totalPrice = product.salePrice * parseInt(quantity, 10);
  //       cart.items.push({
  //         productId: productId,
  //         quantity: parseInt(quantity, 10),
  //         price: product.salePrice,
  //         totalPrice: totalPrice,
  //       });
  //     }
  
  //     // Save the cart
  //     await cart.save();
  
  //     return res.json({ message: 'Item added to cart successfully!', cart });
  //   } catch (error) {
  //     console.error('Error adding to cart:', error);
  //     return res.status(500).json({ error: 'Internal Server Error' });
  //   }
  // };
  


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


  const loadShopping = async (req, res) => {
    try {
        const user = req.session.user;
        const userData = await User.findOne({ _id: user });
        const categories = await Category.find({ isListed: true });
        const categoryIds = categories.map((category) => category._id.toString());
        const page = parseInt(req.query.page) || 1;
        const limit = 12;
        const skip = (page - 1) * limit;
        const products = await Product.find({
            isBlocked: false,
            category: { $in: categoryIds },
        })
            .populate("brand")
            .sort({ createdOn: -1 })
            .skip(skip)
            .limit(limit)
           

        const totalProducts = await Product.countDocuments({
            isBlocked: false,
            category: { $in: categoryIds },
            quantity: { $gt: 0 },
        });
        const totalPages = Math.ceil(totalProducts / limit);

        const brands = await Brand.find({
            isBlocked: false,
        });
        const categoriesWithIds = categories.map((category) => ({ _id: category._id, name: category.name }));

        res.render("shop", {
            user: userData,
            products: products,
            category: categoriesWithIds,
            brand: products.brand,
            totalProducts: totalProducts,
            currentPage: page,
            totalPages: totalPages,
           
        });
    } catch (error) {
        console.log("Shopping page not loading", error);
        res.status(500).send("Server Error");
    }
};



module.exports = {
    productDetails,
    getCart,
    addToCart,
    addToCartDetails,
    updateCart,
    loadShopping
};
