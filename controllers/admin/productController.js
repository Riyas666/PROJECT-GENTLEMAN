// FOR SIMPLE IMPORTSS

const Product = require("../../models/productSchema");
const Category = require("../../models/categorySchema");
const User = require("../../models/userSchema");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { category } = require("./categoryController");
const { uploadProductImage } = require("../../utils/multer");
const { error } = require("console");
const { isArgumentsObject } = require("util/types");
const { BASE_UPLOAD_PATH } = require("../../utils/multer");

//FOR GETTING THE PRODUCT PAGE
const getProductAddPage = async (req, res) => {
    try {
        const category = await Category.find({ isListed: true });
        res.render("product-add", { cat: category });
    } catch (error) {
        res.redirect("/admin/pageerror");
    }
};

//FOR ADD THE PRODUCT
const addProducts = async (req, res) => {
    try {
        const products = req.body;
        console.log("req.body:", products);

        const images = [];

        if (req.files && req.files.length > 0) {
            const uploadPath = path.join( "public", "uploads", "product-images");

            // Ensure the directory exists
            if (!fs.existsSync(uploadPath)) {
                fs.mkdirSync(uploadPath, { recursive: true });
                console.log("Directory created:", uploadPath);
            } else {
                console.log("Directory already exists:", uploadPath);
                           }
            for (let i = 0; i < req.files.length; i++) {
                const originalImagePath = req.files[i].path;
                console.log(originalImagePath)
                
                
                const filename = `${Date.now()}-${req.files[i].originalname}`;
                const resizedImagepath = path.join(uploadPath, filename);
                
                await sharp(originalImagePath).resize({ width: 440, height: 440 }).toFile(resizedImagepath);
                console.log('this is ',filename)
                console.log("this is the resized image path", resizedImagepath)
                // fs.unlinkSync(originalImagePath);
                images.push(filename);
                console.log("image processde and saved", filename);
                
            }
            
        } else {
            console.log("no files uploaded");
        }

        // Solution
        const categoryId = products.category;
        if (!categoryId) {
            return res.status(400).json({ error: "Category is required." });
        }
        const category = await Category.findOne({
            _id: categoryId,
            isListed: true,
        });
        if (!category) {
            return res.status(400).json({ error: "Invalid category name" });
        }

        //SAVING NEW PRODUCT

        const newProduct = new Product({
            productName: products.productName,
            description: products.description,
            brand: products.brand,
            category: category._id,
            regularPrice: products.regularPrice,
            salePrice: products.salePrice,
            createdAt: new Date(),
            color: products.color,
            productImage: images,
            status: "Available",
        });
        console.log(newProduct)

        await newProduct.save();

        return res.redirect("/admin/products");
    } catch (error) {
        console.error("error saving product", error);
        return res.redirect("/admin/pageerror");
    }
};

//FOR GETTING ALL PRODUCTS
const getAllProducts = async (req, res) => {
   
    const search = req.query.search || "";
    const page = req.query.page || 1;
    const limit = 4;

    try {
        const productData = await Product.find({
            productName: { $regex: search, $options: "i" },
        })
            .populate("category") // Populate category field
            .limit(limit)
            .skip((page - 1) * limit);

        const productsWithImages = productData.map((product) => {
            const productObject = product.toObject();
            productObject.imageUrls = product.productImage; // Directly pass the image names
            return productObject;
        });

        const totalProducts = await Product.countDocuments({
            productName: { $regex: search, $options: "i" },
        });

        const totalPages = Math.ceil(totalProducts / limit);

        res.render("products", {
            data: productsWithImages,
            totalPages,
            currentPage: page,
        });
    } catch (error) {
        console.log("Error while fetching the products", error);
        res.redirect("/admin/pageerror");
    }
};

// FOR BLOCKING THE PRODUCT

const blockProduct = async (req, res) => {
    const { id, isBlocked } = req.body;
    try {
        await Product.updateOne({ _id: id }, { $set: { isBlocked } });

        res.status(200).json({ success: true });
        //res.redirect("/admin/products");
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to block product." });
        //res.redirect("/admin/pageerror");
    }
};

//FOR UNBLOCKING THE PRODUCT

const unblockProduct = async (req, res) => {
    try {
        const { id, isBlocked } = req.body;
        await Product.updateOne({ _id: id }, { $set: { isBlocked } });
        res.status(200).json({ success: true });
        // res.redirect("/admin/products");
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to unblock product." });
        // res.redirect("/admin/pageerror");
    }
};

//FOR THE EDIT PRODUCT PAGE
const getEditProduct = async (req, res) => {
    try {
        const id = req.query.id;
        const product = await Product.findOne({ _id: id });
        const category = await Category.find({ isListed: true });

        res.render("edit-product", {
            product: product,
            cat: category,
            // brand:brand,
        });
    } catch (error) {
        res.redirect("/admin/pageerror");
    }
};

//FOR EDIT THE PRODUCT
const editProduct = async (req, res) => {
    try {
        const id = req.params.id;

        const product = await Product.findOne({ _id: id });
        const data = req.body;

        const images = [];

        if (req.files && req.files.length > 0) {
            for (let i = 0; i < req.files.length; i++) {
                images.push(req.files[i].filename);
            }
        }

        const existingImages = Array.isArray(data.existingImages)
            ? data.existingImages
            : data.existingImages
            ? [data.existingImages]
            : [];

        const deletedImages = Array.isArray(data.deletedImages) ? data.deletedImages : [];

        const updatedImages = [...existingImages.filter((img) => !deletedImages.includes(img)), ...images];

        const updateFields = {
            productName: data.productName,
            description: data.description,
            brand: data.brand,
            category: product.category,
            regularPrice: data.regularPrice,
            salePrice: data.salePrice,
            quantity: data.quantity,
            color: data.color,
            productImage: updatedImages,
            size: data.size,
        };

        await Product.findByIdAndUpdate(id, updateFields, { new: true });

        console.log("Product updated successfully:", updateFields);

        res.redirect("/admin/products");
    } catch (error) {
        console.error("Error updating product:", error);
        return res.redirect("/admin/pageerror");
    }
};

const deleteSingleImage = async (req, res) => {
    try {
        const { imageNameToServer, productIdToServer } = req.body;
        const product = await Product.findByIdAndUpdate(
            productIdToServer,
            { $pull: { productImage: imageNameToServer } },
            { new: true }
        );
        const imagePath = path.join("public", "uploads", imageNameToServer);
        if (fs.existsSync(imagePath)) {
            await fs.unlinkSync(imagePath);
            console.log(`Image ${imageNameToServer} deleted Successfully`);
        } else {
            console.log("Image not found");
        }
        res.send({ status: true });
    } catch (error) {
        res.redirect("/pageerror");
    }
};

//EXPORTING..
module.exports = {
    getProductAddPage,
    addProducts,
    getAllProducts,
    blockProduct,
    unblockProduct,
    getEditProduct,
    editProduct,
    deleteSingleImage,
};