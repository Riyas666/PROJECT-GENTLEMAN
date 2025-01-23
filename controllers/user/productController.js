const Product = require("../../models/productSchema");
const Category = require("../../models/categorySchema");
const User = require("../../models/categorySchema");
const Cart = require("../../models/cartSchema");
const Brand = require("../../models/brandSchema");


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
    loadShopping
};
