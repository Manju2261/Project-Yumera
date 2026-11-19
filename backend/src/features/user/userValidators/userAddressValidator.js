const validateUserAddress = (addressData, isUpdate = false) => {
    const requiredFields = [
        "fullName",
        "phone",
        "addressLine",
        "city",
        "state",
        "pincode"
    ]

    if (
        isUpdate &&
        !requiredFields.some((field) => addressData[field] !== undefined)
    ) {
        return "At least one address field is required"
    }

    for (const field of requiredFields) {
        if (!isUpdate || addressData[field] !== undefined) {
            if (
                typeof addressData[field] !== "string" ||
                !addressData[field].trim()
            ) {
                return `${field} is required`
            }
        }
    }

    if (
        addressData.phone !== undefined &&
        !/^[6-9]\d{9}$/.test(addressData.phone.trim())
    ) {
        return "Please enter a valid 10-digit Indian mobile number"
    }

    if (
        addressData.pincode !== undefined &&
        !/^\d{6}$/.test(addressData.pincode.trim())
    ) {
        return "Pincode must contain exactly 6 digits"
    }

    if (
        addressData.isDefault !== undefined &&
        typeof addressData.isDefault !== "boolean"
    ) {
        return "isDefault must be a boolean value"
    }

    return null
}

module.exports = {
    validateUserAddress
}