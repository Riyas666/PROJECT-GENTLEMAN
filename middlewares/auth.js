const User = require("../models/userSchema");

const userAuth = async (req, res, next) => {
    try {
        if (req.session.user) {
            const user = await User.findById(req.session.user);

            if (user) {
                if (user.isBlocked) {
                    // Destroy session if the user is blocked
                    req.session.destroy((err) => {
                        if (err) {
                            console.error("Error destroying session:", err);
                            return res.status(500).send("Internal Server Error");
                        }
                        res.redirect("/login"); // Redirect to login page
                    });
                } else {
                    return next(); // User is authenticated and not blocked
                }
            } else {
                // If user record not found in the database
                req.session.destroy(() => {
                    res.redirect("/login");
                });
            }
        } else {
            return next(); // Allow access to public pages
        }
    } catch (error) {
        console.error("Error in user auth middleware:", error);
        res.status(500).send("Internal Server Error");
    }
};


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

module.exports = {
    userAuth,
    adminAuth,
};
