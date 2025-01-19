const User = require("../../models/userSchema");
const Category = require("../../models/categorySchema");
const Products = require("../../models/productSchema");
const Brand = require("../../models/brandSchema");
const env = require("dotenv").config();
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const Product = require("../../models/productSchema");

//FOR RENDER THE SIGNUP PAGE IF HAVE SESSION THEN TO THE HOME PAGE
const loadSignup = async (req, res) => {
    try {
        if (req.session.user) {
            res.redirect("/home");
        } else {
            res.render("signup");
        }
    } catch (error) {
        console.log("Home page not Loading", error);
        res.status(500).send("Server Error");
    }
};

//AFTER THE SIGNUP PAGE IT WILL MOVE TO THE  OTP
const signup = async (req, res) => {
    try {
        const { name, email, phone, password, cPassword } = req.body;

        if (password !== cPassword) {
            return res.render("signup", { message: "Passwords do not match" });
        }
        const findUser = await User.findOne({ email: email });
        if (findUser) {
            return res.render("signup", { message: "User with this email already exists" });
        }

        const otp = generateOtp();
        const emailSent = await SendVerificationEmail(email, otp);

        if (!emailSent) {
            return res.json("email-error");
        }

        req.session.userOtp = otp;
        req.session.userData = { name, email: email, phone, password };

        res.render("verify-otp");
        console.log(`OTP sent ${otp}`);
    } catch (error) {
        console.error("signup error", error);
        res.redirect("/pageNotFound");
    }
};

//FOR GENERATING THE OTP
function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

//SEND THE OTP TO THE MAIL
async function SendVerificationEmail(email, otp) {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: process.env.NODEMAILER_EMAIL,
                pass: process.env.NODEMAILER_PASSWORD,
            },
        });

        const info = await transporter.sendMail({
            from: process.env.NODEMAILER_EMAIL,
            to: email,
            subject: "Verify your account",
            text: `Your OTP is ${otp}`,
            html: `<b>Your OTP: ${otp}</b>`,
        });

        return info.accepted.length > 0;
    } catch (error) {
        console.error("error sending email", error.message);
        return false;
    }
}

//FOR RESENDING THE OTP
const resendOtp = async (req, res) => {
    try {
        const { email } = req.session.userData;
        if (!email) {
            return res.status(400).json({ success: false, message: "Email not found in session" });
        }

        const otp = generateOtp();
        req.session.userOtp = otp;

        const emailSent = await SendVerificationEmail(email, otp);

        if (emailSent) {
            console.log(`new otp is ${otp}`);
            res.status(200).json({ success: true, message: "OTP Resend Successfully" });
        } else {
            res.status(500).json({ success: false, message: "OTP resend failed" });
        }
    } catch (error) {
        console.error("Error resending OTP", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

//FOR VERIFY THE OTP
const verifyOtp = async (req, res) => {
    try {
        const { otp } = req.body;

        console.log(otp);

        if (otp.toString() === req.session.userOtp.toString()) {
            const user = req.session.userData;
            const passwordHash = await securePassword(user.password);

            const saveUserData = new User({
                name: user.name,
                email: user.email,
                phone: user.phone,
                password: passwordHash,
            });
            await saveUserData.save();
            console.log("user savred");
            req.session.user = saveUserData._id;
            return res.status(200).json({ success: true, redirectUrl: "/home" });
        } else {
            res.status(400).json({ success: false, message: "Invalid OTP, please try again" });
        }
    } catch (error) {
        console.error("Error verifying otp", error);
        res.status(500).json({ success: false, message: "An error occured" });
    }
};

//LOADING THE HOME PAGE ALSO CHECKING THE SESSION
const loadHomePage = async (req, res) => {
    try {
        const user = req.session.user;
        const categories = await Category.find({ isListed: true });
        console.log("Categories:", categories);
        let productData = await Products.find({
            isBlocked: false,
            category: { $in: categories.map((category) => category._id) },
        });

        productData.sort((a, b) => new Date(b.createdOn) - new Date(a.createdOn));
        productData = productData.slice(0, 4);
        console.log(productData, "fdafdafdfdsfdsgf");

        console.log("Product data after sorting and slicing:", productData);
        // const status = User.find
        if (user) {
            const userData = await User.findById(user);
            console.log(userData);
            res.render("home", { user: userData, products: productData });
        } else {
            return res.render("home", { products: productData });
        }
    } catch (error) {
        console.log("Home page not found");
        res.status(500).send("Server Error");
    }
};

//PASSWORD HASHING
const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);

        return passwordHash;
    } catch (error) {
        console.error("Password hashing failed:", error);
        throw new Error("Password hashing failed");
    }
};

//RENDER THE LOGIN PAGE IF SESSION HAVE THEN TO THE HOME PAGE
const loadLogin = async (req, res) => {
    try {
        if (req.session.user) {
            res.redirect("/home");
        } else {
            res.render("login");
        }
    } catch (error) {
        res.redirect("/pageNotFound");
    }
};

//AFTER THE SIGNUP PAGE IT WILL MOVE TO THE HOMEPAGE
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const findUser = await User.findOne({ email: email });

        if (!findUser) {
            return res.render("login", { message: "User Not Found" });
        }
        if (findUser.isBlocked) {
            return res.render("login", { message: "User is Blocked by admin" });
        }

        const passwordMatch = await bcrypt.compare(password, findUser.password);

        if (!passwordMatch) {
            return res.render("login", { message: "Incorrect Password" });
        }

        req.session.user = findUser._id;
        req.session.userData = { name: findUser.name, email: email };
        res.redirect("/home");
    } catch (error) {
        console.error("login error", error);
        res.render("login", { message: "login failed. Please try again" });
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
            .sort({ createdOn: -1 })
            .skip(skip)
            .limit(limit);

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
            brand: brands,
            totalProducts: totalProducts,
            currentPage: page,
            totalPages: totalPages,
        });
    } catch (error) {
        console.log("Shopping page not loading", error);
        res.status(500).send("Server Error");
    }
};

//PAGE NOT FOUND
const pageNotFound = async (req, res) => {
    try {
        res.render("error-404");
    } catch (error) {
        res.redirect("/pageNotFound");
    }
};

//FOR LOGOUT
const logout = async (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                console.log("Session destruction error", err.message);
                return res.redirect("/pageNotFound");
            }
            return res.redirect("/home");
        });
    } catch (error) {
        console.error("Logout error:", error);
        res.redirect("/pageNotFound");
    }
};

//EXPORTING..
module.exports = {
    loadSignup,
    signup,
    resendOtp,
    verifyOtp,
    loadHomePage,
    securePassword,
    loadLogin,
    login,
    loadShopping,
    pageNotFound,
    logout,
};
