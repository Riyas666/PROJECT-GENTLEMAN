const { BRAND_BLOCKED_SUCCESS } = require("../../constants/responseMessage");
const Brand = require("../../models/brandSchema")


const getBrands = async (req, res) => {
    try {
        const brands = await Brand.find({ isBlocked: false })
        console.log(brands)
        res.json(brands);
    } catch (error) {
        console.log("Error fetching products", error);
        res.status(500).json({ error: "Failed to fetch Brands" });
    }
}

module.exports = {
    getBrands
}