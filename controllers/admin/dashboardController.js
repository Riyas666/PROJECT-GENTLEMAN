const Order = require("../../models/orderSchema");
const User = require("../../models/userSchema");
const Coupon = require("../../models/couponSchema")


const loadDashboard = async (req, res) => {
    if (req.session.admin) {
        try {
            const totalOrders = await Order.countDocuments();
            const totalUsers = await User.countDocuments({isAdmin:false})
            const totalSales = await Order.aggregate([
                {$group:{_id:null, totalSales:{$sum:"$finalAmount"}}}
            ]);

            const totalDiscount = await Order.aggregate([
                {$group:{_id:null, totalDiscount:{$sum:"$discount"}}}
            ]);

            const coupons = await Coupon.find({});
            const order = await Order.find({}).populate("userId");
            const orders = order.reverse();
            res.render("dashboard", {
                totalUsers,
                totalOrders,
                totalSales:totalSales[0]?.totalSales || 0,
                totalDiscount:totalDiscount[0]?.totalDiscount || 0,
                orders,
                coupons,
            });
        } catch (error) {
            res.redirect("/pageerror");
        }
    } else {
        res.redirect("/admin/login");
    }
};



const generateReport = async(req,res) =>{
    const {reportType , startDate, endDate} = req.body
    try{
        let reportData = [];
        if(reportType==='Daily'){
            const now = new Date();
            const startOfDay = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0));
            const endOfDay = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999));
            reportData = await Order.find({createdAt:{$gte:new Date(startOfDay), $lte: new Date(endOfDay) }}).populate("userId");

      }else if(reportType==='Weekly'){
            const today = new Date();
            const firstDay = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - today.getUTCDay(), 0, 0, 0, 0));
            const lastDay = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - today.getUTCDay() + 6, 23, 59, 59, 999));
            reportData = await Order.find({createdAt:{$gte:new Date(firstDay), $lte: new Date(lastDay) }}).populate("userId");

      }else if(reportType==='Monthly'){
            const monthStart = new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth(), 1));
            const monthEnd = new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59, 999));
            reportData = await Order.find({createdAt:{$gte: new Date(monthStart), $lte: new Date(monthEnd)}}).populate("userId");
        
       }else if(reportType==='Yearly'){
            const yearStart = new Date(Date.UTC(new Date().getFullYear(), 0, 1));
            const yearEnd = new Date(Date.UTC(new Date().getFullYear(), 11, 31, 23, 59, 59, 999));
            reportData = await Order.find({createdAt:{$gte: new Date(yearStart), $lte: new Date(yearEnd)}}).populate("userId");

      }else if(reportType === 'Custom Date Range'){

            const start = new Date(startDate); 
            const end = new Date(endDate);
            end.setUTCHours(23, 59, 59, 999); 
            reportData = await Order.find({createdAt:{$gte:start, $lte: end}});

      }

      res.json({success:true, reportData})

    }catch(error){
        res.status(500).json({ success: false, message: "Error generating report." });
    };
};


module.exports = {
    generateReport,
    loadDashboard
}