const User = require("../../authentication/models/User");
const {
    uploadUserProfileImageService,
    deleteUserProfileImageService
} = require("./userS3Service")



//---------------------------------------------------------------------
//Update user Profile

const updateUserProfileService = async (userId, profileData) => {
    if (profileData.name !== undefined && !profileData.name.trim()) {
        throw new Error("Name cannot be empty")
    }

    if (profileData.phone !== undefined && !/^[6-9]\d{9}$/.test(profileData.phone.trim())) {
        throw new Error("Please enter a valid 10-digit Indian mobile number")
    }
    
    const user = await User.findById(userId);

    if (!user) 
    {
        throw new Error("User not found");
    }

    if (profileData.name !== undefined) 
    {
        user.name = profileData.name.trim();
    }

    if (profileData.phone !== undefined) 
    {
        user.phone = profileData.phone.trim();
    }

    await user.save();

    return user;
};


//------------------------------------------------------------
// Add Address

const addUserAddressService = async (userId, addressData) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new Error("User not found");
    }

    if (addressData.isDefault) {
        user.addresses.forEach((address) => {
            address.isDefault = false;
        });
    }

    if (user.addresses.length === 0) {
        addressData.isDefault = true;
    }

    user.addresses.push(addressData);

    await user.save();

    return user.addresses;
};


//--------------------------------------------------------
//Update User Address

const updateUserAddressService = async (userId, addressId, addressData) => {
    const user = await User.findById(userId)

    if (!user) {
        throw new Error("User not found")
    }

    const address = user.addresses.id(addressId)

    if (!address) {
        throw new Error("Address not found")
    }

    const allowedFields = [
        "fullName",
        "phone",
        "addressLine",
        "city",
        "state",
        "pincode"
    ]

    allowedFields.forEach((field) => {
        if (addressData[field] !== undefined) {
            address[field] = addressData[field].trim()
        }
    })

    await user.save()

    return user.addresses
};


//---------------------------------------------------------------------
//Delete Address

const deleteUserAddressService = async (userId, addressId) => {
    const user = await User.findById(userId)

    if (!user) {
        throw new Error("User not found")
    }

    const address = user.addresses.id(addressId)

    if (!address) {
        throw new Error("Address not found")
    }

    const wasDefault = address.isDefault
    address.deleteOne()

    if (wasDefault && user.addresses.length > 0)
    {
        user.addresses[0].isDefault = true
    }

    await user.save()

    return user.addresses
}



//--------------------------------------------------------
//Set Default Address

const setDefaultUserAddressService = async (userId, addressId) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new Error("User not found");
    }

    const selectedAddress = user.addresses.id(addressId);

    if (!selectedAddress) {
        throw new Error("Address not found");
    }

    user.addresses.forEach((address) => {
        address.isDefault = address._id.equals(addressId);
    });

    await user.save();

    return user.addresses;
};


//-----------------------------------------------------------------
//Image User Profile Image

const updateUserProfileImageService = async (userId, file) => {
    const user = await User.findById(userId)

    if (!user) {
        throw new Error("User not found")
    }

    const newImageKey = await uploadUserProfileImageService(file)
    const oldImageKey = user.profileImageKey

    user.profileImageKey = newImageKey
    await user.save()

    if (oldImageKey) {
        try {
            await deleteUserProfileImageService(oldImageKey)
        } catch (error) {
            console.error("Failed to delete old profile image:", error)
        }
    }

    return user.profileImageKey
}


//--------------------------------------------------------

module.exports = {
    updateUserProfileService,
    addUserAddressService,
    updateUserAddressService,
    deleteUserAddressService,
    setDefaultUserAddressService,
    updateUserProfileImageService
};