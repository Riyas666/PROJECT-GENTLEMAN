const Order = require("../../models/orderSchema");
const User = require("../../models/userSchema");
const Coupon = require("../../models/couponSchema")
const statuscode = require("../../constants/statusCodes");
const responseMessage = require("../../constants/responseMessage");

const loadDashboard = async (req, res) => {
    if (req.session.admin) {
        try {
            const totalOrders = await Order.countDocuments();
            const totalUsers = await User.countDocuments({ isAdmin: false });
            const totalSales = await Order.aggregate([
                { $group: { _id: null, totalSales: { $sum: "$finalAmount" } } }
            ]);
            const totalDiscount = await Order.aggregate([
                { $group: { _id: null, totalDiscount: { $sum: "$discount" } } }
            ]);
            const coupons = await Coupon.find({});
            const page = parseInt(req.query.page) || 1;  
            const limit = 10;  
            const skip = (page - 1) * limit;
            const order = await Order.find({})
                .populate("userId")
                .sort({ createdAt: -1 })   
                .skip(skip)
                .limit(limit);
            const totalPages = Math.ceil(totalOrders / limit); 
            
            
      const topProduct = await Order.aggregate([
        { $unwind: "$orderedItems" },  
        {
            $group: {
                _id: "$orderedItems.products", 
                totalOrdered: { $sum: "$orderedItems.quantity" } 
            }
        },
        { $sort: { totalOrdered: -1 } }, 
        { $limit: 5 }, 
        {
            $lookup: {
                from: "products", 
                localField: "_id",
                foreignField: "_id",
                as: "productDetails"
            }
        },
        { $unwind: "$productDetails" }, 
        {
            $project: {
                _id: 0,
                productId: "$_id",
                productName: "$productDetails.productName",
                totalOrdered: 1,
                productImage: "$productDetails.productImage",
                salePrice: "$productDetails.salePrice"
            }
        }
    ]);
    

    const topBrands = await Order.aggregate([
        { $unwind: "$orderedItems" },  
        {
            $lookup: {
                from: "products", 
                localField: "orderedItems.products",
                foreignField: "_id",
                as: "productDetails"
            }
        },
        { $unwind: "$productDetails" },
        {
            $group: {
                _id: "$productDetails.brand",
                totalOrdered: { $sum: "$orderedItems.quantity" },
                totalPrice:{$sum:"$orderedItems.price"}
            }
        },
        { $sort: { totalOrdered: -1 } },
        { $limit: 5 }, 
        {
            $lookup: {
                from: "brands",
                localField: "_id",
                foreignField: "_id",
                as: "brandDetails"
            }
        },
        { $unwind: "$brandDetails" },
       
    ]);


            const topCategories = await Order.aggregate([
                { $unwind:"$orderedItems" },
                {
                    $lookup: {
                        from:"products",
                        localField:"orderedItems.products",
                        foreignField:"_id",
                        as:"productDetails"
                    }
                },
                { $unwind: "$productDetails" },
                {
                    $group:{
                        _id:"$productDetails.category",
                        totalOrdered:{$sum:"$orderedItems.quantity"},
                        totalPrice:{$sum:"$orderedItems.price"}
                    }
                },
                { $sort: {totalOrdered:-1}},
                { $limit: 5},
                {
                    $lookup:{
                        from:"categories",
                        localField:"_id",
                        foreignField:"_id",
                        as:"categoryDetails"
                    }
                },
                {$unwind:"$categoryDetails"}
            ])

            res.render("dashboard", {
                totalUsers,
                totalOrders,
                totalSales: totalSales[0]?.totalSales || 0,
                totalDiscount: totalDiscount[0]?.totalDiscount || 0,
                orders: order,
                coupons,
                currentPage: page,
                totalPages,
                topProduct,
                topBrands,
                topCategories
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
            
            reportData = await Order.find({createdAt:{$gte: monthStart, $lte: monthEnd}}).populate("userId");
        
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
        res.status(statuscode.INTERNAL_SERVER_ERROR).json({
            success:false,
            message:responseMessage.SERVER_ERROR
        })
    };
};

const generateGraph = async (req, res) => {
    try {
        const chartData = await Order.aggregate([
            { $sort: { createdAt: 1 } },  
            { 
                $group: {
                    _id: { $dateToString: { format: "%d-%m-%Y", date: "$createdAt" } },
                    totalSales: { $sum: "$finalAmount" },
                    orderCount: { $sum: 1 } 
                }
            },
            { $sort: { _id: 1 } } 
        ]);

        const statusCounts = await Order.aggregate([
            {$group:{_id:"$status", count:{$sum:1}}}
        ])


        const labels = chartData.map(data => data._id);
        const salesData = chartData.map(data => data.totalSales);
        const orderCounts = chartData.map(data => data.orderCount);

        const statusData = {
            delivered: statusCounts.find(s => s._id === "Delivered")?.count || 0,
            cancelled: statusCounts.find(s => s._id === 'Cancelled')?.count || 0,
            pending: statusCounts.find(s => s._id === 'Pending')?.count || 0,
            returned: statusCounts.find(s => s._id === 'Returned')?.count || 0
        };


        res.status(statuscode.OK).json({
            success: true,
            chartData: {
                labels,
                sales: salesData, 
                orders: orderCounts ,
                statusCounts:statusData
            }
        });
    } catch (error) {
        console.error("Error generating chart data:", error);
        res.status(statuscode.INTERNAL_SERVER_ERROR).json({
            success:false,
            message:responseMessage.SERVER_ERROR
        })
    }
};

module.exports = {
    generateReport,
    loadDashboard,
    generateGraph
}