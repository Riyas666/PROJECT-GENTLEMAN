//IMPORT THE MODULES

const User = require("../../models/userSchema");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const Product = require("../../models/productSchema");
const Category = require("../../models/categorySchema");

//FOR ERROR PAGE
const pageerror = async (req, res) => {
    res.render("admin-error");
};


const loadLogin = async (req, res) => {
    if (!req.session.admin){
        res.render("admin-login",{message:null}) 
    }else{
        res.redirect("/admin/dashboard");
    };
};


const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await User.findOne({ email, isAdmin: true });
        if (!admin) {
            return res.render("admin-login", { message: "Invalid email or password" });
        };

        const passwordMatch = await bcrypt.compare(password, admin.password);
        if (!passwordMatch) {
            return res.render("admin-login", { message: "Invalid Email or password" });
        }

        req.session.admin = admin;
        return res.redirect("/admin/dashboard");
    } catch (error) {
        console.error("login error", error);
        return res.redirect("/pageerror");
    };
};

const logout = async (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                console.log("Session destruction error", err);
                return res.redirect("/pageerror");
            }
            res.redirect("/admin/login");
        });
    } catch (error) {
        console.error("Unexpected error during logout", error);
        res.redirect("/pageerror");
    };
};


const getProductOffer = async(req, res) =>{
    try{
        const category = await Category.find({});
        const products = await Product.find({}).populate("category");
        const productsoffer = await Product.find({offerPercentage:{$gt:0}});
        const categoryoffer = await Category.find({offerPercentage:{$gt:0}});
        const merge = [...productsoffer, ...categoryoffer];
        merge.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

            res.render("productOffer", {
                products,
                productsoffer,
                categoryoffer,
                category,
                merge
            });
        }catch(error){
        res.redirect("/pageerror")
    };
};

const createOffer = async(req, res) =>{
    try{

        const {offerName, offerType, selectedItem, offerPercentage, } = req.body;
       
       if(offerType === "product"){

        const products = await Product.findById(selectedItem).populate("category");
        const categoryOffer = products.category.offerPercentage

        if(offerPercentage < products.offerPercentage){

             return res.status(400).json({status:false, message:"Better offer already exist"});

        }else if(categoryOffer > offerPercentage){

            return res.status(400).json({status:false, message:`Category already has a ${categoryOffer}% offer. No need to add a product offer.` });

        }
        
            products.offerPercentage = offerPercentage;
            products.offerName = offerName;

            await products.save();
        
       }else if(offerType === "category"){

        const category = await Category.findById(selectedItem);

        if(offerPercentage < category.offerPercentage){

             return res.status(400).json({status:false, message:"Better offfer already exists"});

       }    

       category.offerPercentage = offerPercentage;
       category.offerName = offerName;

       await category.save();

       const products = await Product.find({category:selectedItem})
       for(let product of products){
        if (product.offerPercentage < offerPercentage){
            
        product.offerPercentage = 0;
        product.offerName = "";

        await product.save()
       }
       }
    }

    return res.status(200).json({ status: true, message: "Offer applied successfully" });
  
    } catch (error) {
      console.error("Error adding offer:", error);
      return res.status(500).json({ status: false, message: "Internal Server Error" });
    }
  };

module.exports = {
    loadLogin,
    login,
    pageerror,
    logout,
    getProductOffer,
    createOffer
};