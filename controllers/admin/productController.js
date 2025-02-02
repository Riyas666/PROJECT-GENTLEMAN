const Product = require("../../models/productSchema");
const Category = require("../../models/categorySchema");
const Brand = require("../../models/brandSchema")
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { uploadProductImage } = require("../../utils/multer");
const { error } = require("console");
const { isArgumentsObject } = require("util/types");
const { BASE_UPLOAD_PATH } = require("../../utils/multer");

//FOR GETTING THE PRODUCT PAGE
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

//FOR ADD THE PRODUCT

const addProducts = async (req, res) => {

    try {

        const products = req.body;
        console.log("req.body:", products);  

        const images = [];

        if (req.files && req.files.length > 0) {
            const uploadPath = path.join( "public", "uploads", "product-images");

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
                images.push(filename);
                console.log("image processde and saved", filename);   
                
            }
            
        } else {
            console.log("no files uploaded");
        }

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
        let sizes = [];
        if (products.sizes && products.quantities) {
            const sizeArray = products.sizes;
            const quantityArray = products.quantities;

            for (let i = 0; i < sizeArray.length; i++) {
                if (sizeArray[i] && quantityArray[i]) {
                    sizes.push({ size: sizeArray[i], quantity: Number(quantityArray[i]) });
                }
            }
        }else {
            console.error("Sizes or Quantities are missing");
        }
        console.log("this are the sizes before saving", sizes)


        //SAVING NEW PRODUCT
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
    const page = parseInt(req.query.page) || 1;
    const limit = 4;

    try {
        const productData = await Product.find({
            productName: { $regex: search, $options: "i" },
        })
            .populate("category")
            .populate("brand")
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
        
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to block product." });
      
    }
};


//FOR UNBLOCKING THE PRODUCT
const unblockProduct = async (req, res) => {
    try {
        const { id, isBlocked } = req.body;
        await Product.updateOne({ _id: id }, { $set: { isBlocked } });
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to unblock product." });
    }
};


//FOR THE EDIT PRODUCT PAGE
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


//FOR EDIT THE PRODUCT
const editProduct = async (req, res) => {
    try {
        const id = req.params.id;
        const data = req.body;
        console.log("Request Body:", data);
console.log("222 uploaded files", req.files)
    

const existingImages = data.existingImages 
? JSON.parse(data.existingImages) 
: [];

console.log("Existing images", existingImages)
        const deletedImages = Array.isArray(data.deletedImages) 
        ? data.deletedImages
      : data.deletedImages
      ? [data.deletedImages]
      : [];

      console.log("deletedImgages", deletedImages)

      const filteredImages = existingImages.filter(
        (img) => !deletedImages.includes(img)
      );
  
      const newImages = req.files ? req.files.map((file) => file.filename) : [];

      console.log("neww", newImages)
  
      const updatedImages = [...filteredImages, ...newImages];

      console.log("updatedImages", updatedImages)
       
        const updateFields = {
            productName: data.productName,
            description: data.description,
            brand: data.brand,
            category: data.category,
            regularPrice: data.regularPrice,
            salePrice: data.salePrice,
            productImage: updatedImages,
            sizes: data.sizes.map((size, index) => ({
              size: size,
              quantity: Number(data.quantities[index]),
            })),
          };
      

          await Product.findByIdAndUpdate(id, updateFields, { new: true });

          console.log("Product updated successfully:", updateFields);
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

//EXPORTING..
module.exports = {
    productAddPage,
    addProducts,
    getAllProducts,
    blockProduct,
    unblockProduct,
    getEditProduct,
    editProduct,
    deleteSingleImage,
};