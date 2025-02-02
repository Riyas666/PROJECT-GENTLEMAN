const mongoose = require("mongoose")
const {Schema} = mongoose


const userSchema = new Schema({
    name: {
        type: String,
        required : true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone : {
        type: String,
        required: false,
        unique: false,
        sparse: true,
        default: null
    },
    googleId: {
        type: String,
        sparse: true, 
        unique: true
    }, 
    password: {
        type: String, 
        required:false
    },
    isBlocked:{
        type: Boolean,
        default: false
    },
    isAdmin : {
        type: Boolean,
        default:false
    },
    cart: [{
        type: Schema.Types.ObjectId, 
        ref: "Cart"
    }],
    wallet: {
        balance: {
          type: Number,
          default: 0,  // Starting wallet balance
        },
        transactions: [{
          type: {
            type: String,  // 'credit' or 'debit'
            required: true,
            enum: ["Credit", "Debit"],
          },
          amount: {
            type: Number,
            required: true,
          },
          description: {
            type: String,  // Description of the transaction (e.g., "Refund for Order #1234")
            required: true,
          },
          date: {
            type: Date,
            default: Date.now,  // Timestamp of the transaction
          },
        }],
      },
    wishlist: [
        {
          productId: { type: Schema.Types.ObjectId, ref: "Product" },
          size: { type: String },
          price:{ type : Number },
          name: {type: String},
          stockStatus: { type: String },
        },
      ],
    // orderHistory: [{
    //     type: Schema.Types.ObjectId,
    //     ref: "Order"
    // }],
   
    referalCode: {
        type: String
    },
    // redeemed: {
    //     type: Boolean
    // },
    redeemedUsers: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }],
    searchHistory: [{
        category: {
            type: Schema.Types.ObjectId,
            ref: "Category"
        },
        brand: {
            type: String
        },
        searchOn: {
            type: Date,
            default: Date.now
        }
    }]
},{timestamps:true})


const User = mongoose.model("User", userSchema)

module.exports = User