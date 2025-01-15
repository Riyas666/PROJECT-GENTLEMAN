//IMPORT THE MODULES

const User = require("../../models/userSchema");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");


//FOR ERROR PAGE
const pageerror = async (req, res) => {
    res.render("admin-error");
};


// LOAD LOGIN PAGE BASED ON THE SESSION
const loadLogin = async (req, res) => {
    if (!req.session.admin) {
        res.render("admin-login",{message:null}) 
    }else{
        res.redirect("/admin/dashboard");
    }
   
};


//FOR LOGIN
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await User.findOne({ email, isAdmin: true });
        if (!admin) {
            return res.render("admin-login", { message: "Invalid email or password" });
        }

        //COMPARE TWO PASSWORDS
        const passwordMatch = await bcrypt.compare(password, admin.password);
        if (!passwordMatch) {
            return res.render("admin-login", { message: "Invalid Email or password" });
        }
        req.session.admin = admin;
        return res.redirect("/admin/dashboard");
    } catch (error) {
        console.error("login error", error);
        return res.redirect("/pageerror");
    }
};


//TO LOAD THE DASHBOARD FOR LOGGED ONES
const loadDashboard = async (req, res) => {
    if (req.session.admin) {
        try {
            res.render("dashboard");
        } catch (error) {
            res.redirect("/pageerror");
        }
    } else {
        res.redirect("/admin/login");
    }
};


//FOR LOGOUT
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
    }
};


//EXPORTING..
module.exports = {
    loadDashboard,
    loadLogin,
    login,
    pageerror,
    logout,
};