const express = require("express");

const {
    getUserProfileController,
    updateUserProfileController,
    addUserAddressController,
    updateUserAddressController,
    deleteUserAddressController,
    setDefaultUserAddressController,
    updateUserProfileImageController
} = require("../userControllers/userController");


const authMiddleware = require("../../authentication/middleware/authMiddleware");
const userUploadMiddleware = require("../userMiddlewares/userUploadMiddleware")

const router = express.Router();

router
    .get("/profile", authMiddleware, getUserProfileController)
    .patch("/profile", authMiddleware, updateUserProfileController)
    .post("/addresses", authMiddleware, addUserAddressController)
    .patch("/addresses/:addressId", authMiddleware, updateUserAddressController)
    .delete("/addresses/:addressId", authMiddleware, deleteUserAddressController)
    .patch("/addresses/:addressId/default", authMiddleware, setDefaultUserAddressController)
    .post(
        "/profile/image",
        authMiddleware,
        userUploadMiddleware.single("profileImage"),
        updateUserProfileImageController
    )

module.exports = router;