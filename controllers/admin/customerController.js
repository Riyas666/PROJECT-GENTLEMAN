const User = require("../../models/userSchema");

const customerInfo = async (req, res) => {
    try {
        let search = "";
        if (req.query.search) {
            search = req.query.search;
        }
        let page = 1;
        if (req.query.page) {
            page = parseInt(req.query.page);
        }
        const limit = 6;
        const userData = await User.find({
            isAdmin: false,
            $or: [{ name: { $regex: ".*" + search + ".*" } }, { email: { $regex: ".*" + search + ".*" } }],
        })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await User.countDocuments({
            isAdmin: false,
            $or: [{ name: { $regex: ".*" + search + ".*" } }, { email: { $regex: ".*" + search + ".*" } }],
        });

        const totalPages = Math.ceil(count / limit);
        res.render("customers", {
            data: userData,
            totalPages,
            currentPage: page,
        });
    } catch (error) {
        console.error("Error in customerInfo:", error.message);
        res.redirect("/admin/pageerror");
    }
};

const customerBlocked = async (req, res) => {
    try {
        const { id } = req.body;
        await User.updateOne({ _id: id }, { $set: { isBlocked: true } });
        res.redirect("/admin/users");
    } catch (error) {
        res.redirect("/pageerror");
    }
};

const customerunBlocked = async (req, res) => {
    try {
        const { id } = req.body;
        await User.updateOne({ _id: id }, { $set: { isBlocked: false } });
        res.redirect("/admin/users");
    } catch (error) {
        console.error("Error in customerunBlocked:", error.message);
        res.redirect("/admin/pageerror");
    }
};

module.exports = {
    customerInfo,
    customerunBlocked,
    customerBlocked,
};
