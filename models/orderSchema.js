const mongoose = require("mongoose")
const {Schema} = mongoose
const {v4:uuidv4} = require("uuid")


const orderSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User", 
        required: true
    },
    orderId: {
        type: String,
        default: ()=>uuidv4(),
        unique:true
    },
    orderedItems: [{
        products: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },
        productName:{
            type:String,
            required:true
        },
        productImage: [{
            type: String
        }],
        size:{
            type:Number,
            required:true
        },
        quantity: {
            type: Number,
            required: true
        },
        price: {
            type: Number,
            default: 0
        }
    }],
    totalPrice: {
        type: Number, 
        required: true
    },
    discount: {
        type: Number,
        default: 0
    },
    finalAmount: {
        type: Number,
        required: true
    },
    address:{
        addressType: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        pincode: {
            type: Number,
            required: true
        },
        landmark: { 
            type: String,
            required: true
        },
        phonenumber: {
            type: String,
            required: true
        },
        
    },
    status: {
        type: String,
        required:true,
        enum: ["Pending", "Delivered", "Cancelled", "Return Request", "Returned", "Return Rejected"]
    },
    returnReason:{
         type:String,
         required:false
    },
    cancelReason:{
        type:String,
        required:false
    },
   
    couponApplied: {
        type: Boolean,
        default: false
    },

    paymentType: {
        type: String,
        enum: ["Razorpay", "COD", "Wallet"], 
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ["Pending", "Failed", "Success"],
        default: "Pending"
    },
    
},{timestamps:true})

const Order = mongoose.model("Order", orderSchema)
module.exports = Order