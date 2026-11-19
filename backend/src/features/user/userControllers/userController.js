const {
    updateUserProfileService,
    addUserAddressService,
    updateUserAddressService,
    deleteUserAddressService,
    setDefaultUserAddressService,
    updateUserProfileImageService
} = require("../userServices/userService");

const {
    validateUserAddress,
} = require("../userValidators/userAddressValidator")

const {
    getUserProfileImageUrlService
} = require("../userServices/userS3Service")


//-----------------------------------------------------
// Get User profile

const getUserProfileController = async (req, res) => {
    try {
        const user = req.user

        const profileImageUrl = await getUserProfileImageUrlService(
            user.profileImageKey
        )

        return res.status(200).json({
            success: true,
            message: "User profile fetched successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                authProvider: user.authProvider,
                profileImageKey: user.profileImageKey,
                profileImageUrl,
                addresses: user.addresses
            }
        })
    } catch (error) 
    {
        console.error("Get user profile error:", error)

        return res.status(500).json({
            success: false,
            message: "Failed to fetch user profile"
        })
    }
}


//------------------------------------------------------------
//Update User Profile

const updateUserProfileController = async (req, res) => {
    try {
        const { name, phone } = req.body;

        const user = await updateUserProfileService(
            req.user._id,
            { name, phone }
        );

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                authProvider: user.authProvider,
                addresses: user.addresses,
            },
        });
    } catch (error) 
    {
        const statusCode = error.message === "User not found" ? 404 : 400

        return res.status(statusCode).json({
            success: false,
            message: error.message
        })
    }
};


//---------------------------------------------------------------
// Add user Addreess

const addUserAddressController = async (req, res) => {
    try {
        const validationError = validateUserAddress(req.body);

        if (validationError) 
        {
            return res.status(400).json({
                success: false,
                message: validationError,
            });
        }

        const {
            fullName,
            phone,
            addressLine,
            city,
            state,
            pincode,
            isDefault,
        } = req.body;

        const addresses = await addUserAddressService(
            req.user._id,
            {
                fullName,
                phone,
                addressLine,
                city,
                state,
                pincode,
                isDefault,
            }
        );

        return res.status(201).json({
            success: true,
            message: "Address added successfully",
            addresses,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};


//-----------------------------------------------------------
//Update User Address

const updateUserAddressController = async (req, res) => {
    try {
        const validationError = validateUserAddress(req.body, true)

        if (validationError) {
            return res.status(400).json({
                success: false,
                message: validationError,
            })
        }

        const { addressId } = req.params;

        const addresses = await updateUserAddressService(
            req.user._id,
            addressId,
            req.body,
        )

        return res.status(200).json({
            success: true,
            message: "Address updated successfully",
            addresses,
        })
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        })
    }
}


//---------------------------------------------------------------
//Delete User Address

const deleteUserAddressController = async (req, res) => {
    try {
        const { addressId } = req.params;

        const addresses = await deleteUserAddressService(
            req.user._id,
            addressId
        );

        return res.status(200).json({
            success: true,
            message: "Address deleted successfully",
            addresses,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};


//-----------------------------------------------------
//Set Default Address

const setDefaultUserAddressController = async (req, res) => {
    try {
        const { addressId } = req.params;

        const addresses = await setDefaultUserAddressService(
            req.user._id,
            addressId
        );

        return res.status(200).json({
            success: true,
            message: "Default address updated successfully",
            addresses,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};


//---------------------------------------------------------------
//Image Update - Use Profile

const updateUserProfileImageController = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "Please select a profile image"
            })
        }

        const profileImageKey = await updateUserProfileImageService(
            req.user._id,
            req.file
        )

        return res.status(200).json({
            success : true,
            message : "Profile image updated successfully",
            profileImageKey
        })
    } catch (error) {
        return res.status(500).json({
            success : false,
            message: error.message || "Failed to update profile image"
        })
    }
}


//--------------------------------------------------------------------

module.exports = {
    getUserProfileController,
    updateUserProfileController,
    addUserAddressController,
    updateUserAddressController,
    deleteUserAddressController,
    setDefaultUserAddressController,
    updateUserProfileImageController
};