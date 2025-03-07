const Category = require("../../models/categorySchema");
const Brand = require("../../models/brandSchema");
const Product =require("../../models/productSchema");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { uploadProductImage } = require("../../utils/multer");
const { error } = require("console");
const { isArgumentsObject } = require("util/types");
const { BASE_UPLOAD_PATH } = require("../../utils/multer");
const statuscode = require("../../constants/statusCodes");
const responseMessage = require("../../constants/responseMessage");


const productAddPage = async (req, res) => {
    try {
        const category = await Category.find({ isListed: true });
        console.log(category)
        const brand = await Brand.find({isBlocked:false})
        res.render("product-add", { cat: category ,brand:brand});
    } catch (error) {
        res.redirect("/admin/pageerror");
    }
};

const addProducts = async (req, res) => {
    try {
        const products = req.body;
        const images = [];
        if (req.files && req.files.length > 0) {
            const uploadPath = path.join( "public", "uploads", "product-images");
            if (!fs.existsSync(uploadPath)) {
                fs.mkdirSync(uploadPath, { recursive: true });
            } else {
                console.log("Directory already exists:", uploadPath);  
                           }
            for (let i = 0; i < req.files.length; i++) {
                const originalImagePath = req.files[i].path;
                console.log(originalImagePath)
                const filename = `${Date.now()}-${req.files[i].originalname}`;
                const resizedImagepath = path.join(uploadPath, filename);
                await sharp(originalImagePath).resize({ width: 440, height: 440 }).toFile(resizedImagepath);
                images.push(filename);                
            }
        } else {
            console.log("no files uploaded");
        };

        const categoryId = products.category;
        if (!categoryId) {
            return res.status(statuscode.BAD_REQUEST).json({
                success:false, 
                message: responseMessage.CATEGORY_REQUIRED 
            });
        };

        const category = await Category.findOne({
            _id: categoryId,
            isListed: true,
        });

        if (!category) {
            return res.status(statuscode.BAD_REQUEST).json({ 
                success:false,
                error: "Invalid category name" 
            });
        };

        let sizes = [];
        if (products.sizes && products.quantities) {
            const sizeArray = products.sizes;
            const quantityArray = products.quantities;

            for (let i = 0; i < sizeArray.length; i++) {
                if (sizeArray[i] && quantityArray[i]) {
                    sizes.push({ size: sizeArray[i], quantity: Number(quantityArray[i]) });
                };
            };
        }else {
            console.error("Sizes or Quantities are missing");
        };

        const newProduct = new Product({
            productName: products.productName,
            description: products.description,
            brand: products.brand,
            category: category._id,
            regularPrice: products.regularPrice,
            salePrice: products.salePrice,
            createdAt: new Date(),
            productImage: images,
            sizes: sizes,
            status: "Available",
        });
        await newProduct.save();
        return res.redirect("/admin/products");
    } catch (error) {
        console.error("error saving product", error);
        return res.status(statuscode.INTERNAL_SERVER_ERROR).json({ 
            success: false, 
            message: responseMessage.SERVER_ERROR
    })
};
}


const getAllProducts = async (req, res) => {
    const search = req.query.search || "";
    const page = parseInt(req.query.page) || 1;
    const limit = 7;
    try {
        const productData = await Product.find({
            productName: { $regex: search, $options: "i" },
        })
            .populate("category")
            .populate("brand")
            .sort({ createdAt: -1 }) 
            .limit(limit)
            .skip((page - 1) * limit);

        const productsWithImages = productData.map((product) => {
            const productObject = product.toObject();
            productObject.imageUrls = product.productImage; 
            return productObject;
        });

        const totalProducts = await Product.countDocuments({
            productName: { $regex: search, $options: "i" },
        });

        const totalPages = Math.ceil(totalProducts / limit);

       const data = productsWithImages
        res.render("products", {
            data,
            totalPages,
            currentPage: page,
        });
    } catch (error) {
        console.log("Error while fetching the products", error);
        res.redirect("/admin/pageerror");
    }
};


const blockProduct = async (req, res) => {
    const { id } = req.body;
    try {
        await Product.updateOne({ _id: id }, { $set: { isBlocked:true } });
        res.status(statuscode.OK).json({ 
            success: true,
            message:responseMessage.PRODUCT_BLOCKED 
        });
    } catch (error) {
        res.status(statuscode.INTERNAL_SERVER_ERROR).json({ 
            success: false, 
            message: responseMessage.SERVER_ERROR 
        });
    }
};

const unblockProduct = async (req, res) => {
    try {
        const { id } = req.body;
        await Product.updateOne({ _id: id }, { $set: { isBlocked:false } });
        res.status(statuscode.OK).json({ 
            success: true,
            message:responseMessage.USER_UNBLOCKED 
        });
    } catch (error) {
        res.status(statuscode.INTERNAL_SERVER_ERROR).json({ 
            success: false, 
            message: responseMessage.SERVER_ERROR 
        });
    }
};

const getEditProduct = async (req, res) => {
    try {
        const id = req.query.id;
        const product = await Product.findOne({ _id: id });
        const category = await Category.find({ isListed: true });
        const brand = await Brand.find({isBlocked:false})
        const sizes = product.sizes || [];

        res.render("edit-product", {
            product: product,
            cat: category,
            brand:brand,
            sizes: sizes,
        });

    } catch (error) {
        res.redirect("/admin/pageerror");
    }
};

const editProduct = async (req, res) => {
    try {
        const id = req.params.id;
        const data = req.body;    
        const existingImages = data.existingImages
         ? JSON.parse(data.existingImages)
         : [];
        const deletedImages = Array.isArray(data.deletedImages) 
        ? data.deletedImages
      : data.deletedImages
      ? [data.deletedImages]
      : [];
      
      const filteredImages = existingImages.filter(
        (img) => !deletedImages.includes(img)
      );
  
      const newImages = req.files ? req.files.map((file) => file.filename) : [];  
      const updatedImages = [...filteredImages, ...newImages];
      const sizesArray = req.body.sizes || [];
      const quantitiesArray = req.body.quantities || [];
      const sizes = sizesArray.map((size, index) => ({
        size: size,
        quantity: parseInt(quantitiesArray[index], 10) || 0 
    }));
      const updateFields = {
        productName: data.productName,
        description: data.description,
        brand: data.brand,
        category: data.category,
        regularPrice: data.regularPrice,
        salePrice: data.salePrice,
        productImage: updatedImages,
        sizes: sizes
      };

          await Product.findByIdAndUpdate(id, updateFields, { new: true });
          res.redirect("/admin/products");
        } catch (error) {
          console.error("Error updating product:", error);
          res.redirect("/admin/pageerror");
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


module.exports ={
    productAddPage,
    addProducts,
    getAllProducts,
    blockProduct,
    unblockProduct,
    getEditProduct,
    editProduct,
    deleteSingleImage,
};