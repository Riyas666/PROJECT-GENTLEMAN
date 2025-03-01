const mongoose = require("mongoose")
const {schema} = mongoose


const categorySchema = new mongoose.Schema({
    name: {
        type: String, 
        required : true,
        unique : true
    },
    description: {
        type: String,
        required : true
    },
    isListed: {
        type: Boolean,
        default : true
    },
    offerPercentage:{
        type: Number,
        default:0
    },
    offerName: {
        type: String,
        required: false
    }, 
   
}, {timestamps:true})


const Category = mongoose.model("Category", categorySchema)


module.exports = Category