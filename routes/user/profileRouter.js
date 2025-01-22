const express = require("express");
const router = express.Router();
const { userAuth } = require("../../middlewares/auth");
const personalController =require("../../controllers/user/personalController");



//PASSWORD SECTION
router.get("/", userAuth, personalController.profilePage)
router.post('/update', userAuth, personalController.updateProfile);
router.get("/change-password", userAuth, personalController.getChangePassword)
router.post("/change-password", userAuth, personalController.changePassword)


//ADDRESS SECTION
router.get("/address", userAuth, personalController.getAddressPage)
router.post('/add-address', userAuth, personalController.addAddress);
router.post('/edit-address', userAuth, personalController.editAddress);
router.delete('/profile/delete-address/:addressId',userAuth, personalController. deleteAddress);



module.exports = router;