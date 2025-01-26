const express = require("express");
const app = express();
const path = require("path");
const dotenv = require("dotenv");
const nocache = require("nocache");
const session = require("express-session");
const passport = require("./config/passport");
dotenv.config();
const db = require("./config/db");

const userRouter = require("./routes/userRouter");
const profileRouter = require("./routes/user/profileRouter");
const cartRouter = require("./routes/user/cartRouter");
const brandRouter = require("./routes/admin/brandRouter");
const adminRouter = require("./routes/admin/adminRouter");
const productRouter = require("./routes/admin/productRouter");
const categoryRouter = require("./routes/admin/categoryRouter");
const customerRouter = require("./routes/admin/customerRouter");
const orderRouter = require("./routes/admin/orderRouter");
db();

const logoutStatusMiddleware = require("./middlewares/logoutStatus");
app.use(nocache());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false,
            httpOnly: true,
            maxAge: 72 * 60 * 60 * 1000,
        },
    })
);

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    res.set("cache-control", "no-store");
    next();
});

app.set("view engine", "ejs");
app.set("views", [path.join(__dirname, "views/user"), path.join(__dirname, "views/admin")]);
app.use(express.static(path.join(__dirname, "public")));

app.use(logoutStatusMiddleware);

app.use("/", userRouter);
app.use("/profile", profileRouter);
app.use("/cart", cartRouter);
app.use("/admin", adminRouter);
app.use("/admin/category", categoryRouter);
app.use("/admin/products", productRouter);
app.use("/admin/brands", brandRouter);
app.use("/admin/users", customerRouter);
app.use("/admin/orders", orderRouter)



const PORT = 3000 || process.env.PORT;
app.listen(PORT, () => {
    console.log("Server Running");
});

module.exports = app;