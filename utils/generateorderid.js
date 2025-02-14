function generateOrderId() {
    const randomDigits = Math.floor(100000 + Math.random() * 900000); // 6-digit number
    return `ORD${randomDigits}`;
}

module.exports = generateOrderId;
