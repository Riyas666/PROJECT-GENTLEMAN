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
        const page = parseInt(req.query.page) || 1;
        const limit = 12;
        const skip = (page - 1) * limit;


        let query = {}

        if(req.query.search){
            query.productName = {$regex:req.query.search, $options:'i'}
        }
        if(req.query.category){
            query.category = req.query.category;
        }

        let productsQuery = Product.find(query).populate('brand')

        if(req.query.sort){
            switch(req.query.sort){
                case 'price_asc':
                    productsQuery = productsQuery.sort({salePrice:1});
                    break;
                    case 'price_desc':
                        productsQuery = productsQuery.sort({salePrice:-1});
                        break;
                        case 'newest':
                            productsQuery = productsQuery.sort({createdAt:-1});
                            break;
            }
        }



        
        const products = await productsQuery.skip(skip).limit(limit);
        const totalProducts = await Product.countDocuments(query);
        const totalPages = Math.ceil(totalProducts / limit);
        const categories = await Category.find({ isListed: true });


        

        res.render("shop", {
          

            products: products,
            categories: categories,
            searchQuery: req.query.search || '',
            selectedCategory: req.query.category || '',
            sortBy: req.query.sort || '',
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
