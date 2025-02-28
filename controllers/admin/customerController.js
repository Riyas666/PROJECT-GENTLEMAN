const User = require("../../models/userSchema");
const statuscode = require("../../constants/statusCodes");
const responseMessage = require("../../constants/responseMessage");


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
        const limit = 5;
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
    const { id } = req.body;

    try {
        await User.updateOne({ _id: id }, { $set: { isBlocked:true } });
        res.status(statuscode.OK).json({ 
            success: true ,
            message: responseMessage.USER_BLOCKED
        });
    } catch (error) {
        res.status(statuscode.INTERNAL_SERVER_ERROR).json({
            success:false,
            message:responseMessage.SERVER_ERROR
        })
    }
};


const customerunBlocked = async (req, res) => {
    try {
        const { id } = req.body;
        await User.updateOne({ _id: id }, { $set: { isBlocked:false } });
        res.status(statuscode.OK).json({ 
            success: true,
            message:responseMessage.USER_UNBLOCKED 
        });
       
    } catch (error) {
        console.error("Error in customerunBlocked:", error.message);
        res.status(statuscode.INTERNAL_SERVER_ERROR).json({
            success:false,
            message:responseMessage.SERVER_ERROR
        })
    }
};


module.exports = {
    customerInfo,
    customerunBlocked,
    customerBlocked,
};