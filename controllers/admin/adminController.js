//IMPORT THE MODULES

const User = require("../../models/userSchema");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const Order = require("../../models/orderSchema")
const Coupon = require("../../models/couponSchema")

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
            const totalOrders = await Order.countDocuments();

            const totalSales = await Order.aggregate([
                {$group:{_id:null, totalSales:{$sum:"$finalAmount"}}}
            ])

            const totalDiscount = await Order.aggregate([
                {$group:{_id:null, totalDiscount:{$sum:"$discount"}}}
            ])
            const coupons = await Coupon.find({})


            const order = await Order.find({})
            const orders = order.reverse()
          
            res.render("dashboard", {
                totalOrders,
                totalSales:totalSales[0]?.totalSales || 0,
                totalDiscount:totalDiscount[0]?.totalDiscount || 0,
                orders,
                coupons
            });
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

const generateReport = async(req,res) =>{
    const {reportType , startDate, endDate} = req.body
    console.log("qq", reportType)
    try{
      let reportData = [];
      console.log("qq", reportType)

      if(reportType==='Daily'){
        const today = new Date();
        const startOfDay =new Date(today.setHours(0,0,0,0));
        const endOfDay = new Date(today.setHours(23,59,59,999));

        reportData = await Order.aggregate([
            {$match:
                {createdAt:{$gte:startOfDay, $lte:endOfDay}
                }
            },
            {$group:{
                    _id:null,
                    totalSales:{$sum:"$finalAmount"},
                    totalDiscount:{$sum:"$discount"},
                    totalOrders:{$sum:1},
                    createdAt:{$first:"$createdAt"}
                    }
                },
                { $project: {_id:0, totalSales: 1 , totalDiscount: 1 , totalOrders: 1 , createdAt:1} }
           ]);
      }else if(reportType==='Weekly'){
        const today = new Date();
        const firstDay = new Date(today);
        firstDay.setDate(today.getDate() - today.getDay());
        
        const lastDay = new Date(today);
        lastDay.setDate(today.getDate() - today.getDay() + 6);

        reportData = await Order.aggregate([
            {$match:
                {createdAt:{$gte:firstDay, $lte:lastDay}
                }
            },
            {$group: {
                     _id:null,
                     totalSales:{$sum:"$finalAmount"},
                     totalDiscount:{$sum:"$discount"},
                     totalOrders:{$sum:1},
                     createdAt:{$first:"$createdAt"}
                     }
                },
                { $project: {_id:0, totalSales: 1 , totalDiscount: 1 , totalOrders: 1 , createdAt:1} }
        ])
      }else if(reportType==='Yearly'){
        const yearStart = new Date(new Date().getFullYear(),0,1);
        const yearEnd = new Date(new Date().getFullYear(),11,31)

        reportData = await Order.aggregate([
            {$match:
                {createdAt:{$gte:yearStart, $lte:yearEnd}
                }
            },
            {$group:{
                    _id:null,
                    totalSales:{$sum:"$finalAmount"},
                    totalDiscount:{$sum:"$discount"},
                    totalOrders:{$sum:1},
                    createdAt:{$first:"$createdAt"}
                    }
             },
             { $project: {_id:0, totalSales: 1 , totalDiscount: 1 , totalOrders: 1 , createdAt:1} }
        ])
      }else if(reportType === 'Custom Date Range'){
        reportData = await Order.aggregate([
            {$match:
                {createdAt:{$gte:new Date(startDate), $lte: new Date(endDate) }
                }
            },
            {$group:{
                _id:null,
                totalSales:{$sum:"$finalAmount"},
                totalDiscount:{$sum:"$discount"},
                totalOrders:{$sum:1},
                createdAt:{$first:"$createdAt"}
                    }
                },
                { $project: {_id:0, totalSales: 1 , totalDiscount: 1 , totalOrders: 1 , createdAt:1} }
        ])
      }
      console.log("zzzzzzz", reportData)
      res.json({success:true, reportData})

    }catch(error){
        console.error("Error generating report:", error);
        res.status(500).json({ success: false, message: "Error generating report." });
    }
}


//EXPORTING..
module.exports = {
    loadDashboard,
    loadLogin,
    login,
    pageerror,
    logout,
    generateReport
};