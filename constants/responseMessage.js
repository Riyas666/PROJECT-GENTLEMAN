const responseMessage = Object.freeze({
    OFFER_ALREADY_EXISTS: "Better offer already exists",
    CATEGORY_HAS_BETTER_OFFER: (categoryOffer) => 
        `Category already has a ${categoryOffer}% offer. No need to add a product offer.`,
    OFFER_APPLIED_SUCCESS: "Offer applied successfully",
    OFFER_NOT_FOUND: "Offer not found",
    OFFER_REMOVED_SUCCESS: "Offer successfully removed",
    COUPON_EXIST: "Coupon name already exists!",
    COUPON_ADDED: "Coupon added successfully",
    COUPON_UPDATED:"Coupon Updated Successfully",
    COUPON_DELETED: "Coupon deleted successfully",
    ORDER_NOT_FOUND:"Order not found",
    USER_NOT_FOUND:"User not found",
    ORDER_STATUS_UPDATED: "Order status has been updated successfully",
    BRAND_NOT_FOUND:"Brand Not Found",
    BRAND_EXIST: "Brand Already Exists",
    BRAND_ADDED: "Brand added successfully",
    BRAND_BLOCKED_SUCCESS:"Brand blocked successfully",
    BRAND_UNBLOCKED_SUCCESS:"Brand unblocked successfully",
    USER_BLOCKED:"User has been Blocked",


//ORDER CONTROLLER 
    INVALID_ORDER_DETAILS: "Invalid order details.",
    CART_EMPTY: "Cart is empty.",
    PRODUCT_NOT_FOUND: "Product not found.",
    STOCK_NOT_AVAILABLE: (productName, size) => `Stock not available for ${productName} (Size: ${size}).`,
    ADDRESS_NOT_FOUND: "Address not found.",
    COD_LIMIT: "COD is only available for orders below ₹1000.",
    WALLET_INSUFFICIENT: "Not enough balance in wallet.",
    ORDER_PLACED: "Order placed successfully!",
    PAYMENT_FAILED: "Payment Verification Failed",
    PAYMENT_SUCCESS: "Payment Verified Successfully",
    RETRY_PAYMENT_fAILED: "Retry payment verification failed",
    RETRY_PAYMENT_SUCCESS: "Retry payment verified Successfully",
    ORDER_CANCELLED: "Your order has been cancelled Successfully.",
    RETURN_REQUEST_SUCCESS: "Return request submitted Successfully",
    INVALID_INPUT: "Invalid product, size, or quantity.",
    PRODUCT_NOT_FOUND: "Product not found.",
    ITEM_ADDED: "Item added to cart successfully!",

    CART_NOT_FOUND: "Cart not found.",
    CART_ITEM_NOT_FOUND:"Item not found in cart.",
    ITEM_NOT_FOUND: "Item not found in cart.",
    MAX_QUANTITY_LIMIT: (max) => `You can only add up to ${max} items of this product.`,
    NOT_ENOUGH_STOCK: (size) => `Not enough stock available for size ${size}.`, 

    USER_UNBLOCKED:"User has been Unblocked",
    PRODUCT_BLOCKED:"Product has been Blocked",
    PRODUCT_UNBLOCKED:"Product has been Unblocked",


    INVALID_COUPON: "Invalid coupon.",
    COUPON_APPLIED: "Coupon applied successfully.",

  
    PRODUCT_ALREADY_WISHLIST: "Product already in wishlist",
    PRODUCT_REMOVED_WISHLIST: "Product removed from wishlist successfully",
 //PERSONALCONROLLER

  PROFILE_UPDATE_SUCCESS: "Profile updated successfully",
  PASSWORD_INCORRECT: "Current password is incorrect.",
  PASSWORD_MISMATCH: "New password and confirm password do not match.",
  PASSWORD_TOO_SHORT: "Password must be at least 8 characters long.",
  PASSWORD_UPDATED: "Password updated successfully.",


  ADDRESS_ADDED: "Address added successfully",
  ADDRESS_NOT_FOUND: "User address not found",
  ADDRESS_UPDATED: "Address updated successfully",
  ADDRESS_DELETED: "Address deleted successfully",




  OTP_RESEND_SUCCESS: "OTP Resend Successfully",
  INVALID_OTP: "Invalid OTP, please try again",

    CATEGORY_REQUIRED:"Category Is Required",




    CATEGORY_EXIST:"Category already exist",
    CATEGORY_LISTED:"Category listed successfully",
    CATEGORY_UNLISTED:"Category unlisted successfully",
    CATEGORY_ADDED:"Category added Successfully",
    CATEGORY_UPDATED:"Category Updated Successfully",
    PRODUCT_ADDED: 'Product added successfully',
    PRODUCT_NOT_FOUND: 'Product not found',
    PRODUCT_DELETED: 'Product deleted successfully',
    PRODUCT_UPDATED: 'Product updated successfully',
    RETURN_APPROVED: "Return approved and refund processed",
    RETURN_REJECTED: "Return Request Rejected",
    INVALID_REQUEST: 'Invalid request',
    USER_UNAUTHORIZED: 'User unauthorized',
    SERVER_ERROR: 'Internal server error',


    OTP_FAILED:'OTP resend Failed'
})


module.exports = responseMessage;