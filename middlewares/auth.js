const User = require("../models/userSchema");



const adminAuth = (req, res, next) => {
    try {
        if (req.session.admin) {
            next();
        } else {
            res.redirect("/admin/login");
        }
    } catch (error) {
        console.log(error);
    }
};



const userAuth = (req, res, next) => {
    try {
        if (req.session.user) {
            next();
        } else {
            res.redirect("/login");
        }
    } catch (error) {
        console.log(error);
    }
};






module.exports = {
    userAuth,
    adminAuth,
};
