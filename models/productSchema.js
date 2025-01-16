const mongoose = require("mongoose")
const {Schema} = mongoose



const SizeSchema = new mongoose.Schema({
    size: { type: String, required: true },
    quantity: { type: Number, required: true }
});


const productSchema = new Schema({
    productName: {
        type: String,
        required: true
    },
    description: {
        type: "String",
        required: true
    },
    brand: { 
        type: mongoose.Schema.Types.ObjectId,
         ref: "Brand" ,
         required:true
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: "Category",
        required: true
    },
    regularPrice: {
        type: Number,
        required: true
    },
    salePrice:{
        type: Number,
        required:true                           
    },
    productOffer:{
        type: Number,
        default: 0
    },
    color: {
        type: String,
        required: false
    },
    sizes: [SizeSchema],
    productImage: [{
        type: String
    }],
    isBlocked: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum:["Available", "out of stock", "Discontinued"],
        required: true,
        default: "Available"
    },
 


}, {timestamps:true})


const Product = mongoose.model("Product", productSchema)


module.exports = Product