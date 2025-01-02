const User = require("../../models/userSchema");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const pageerror = async (req, res) => {
    res.render("admin-error");
};

const loadLogin = async (req, res) => {
    if (req.session.admin) {
        return res.redirect("/admin/dashboard");
    }
    res.render("admin-login", { message: null });
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await User.findOne({ email, isAdmin: true });
        if (!admin) {
            return res.render("admin-login", { message: "Invalid email or password" });
        }

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

module.exports = {
    loadDashboard,
    loadLogin,
    login,
    pageerror,
    logout,
};
