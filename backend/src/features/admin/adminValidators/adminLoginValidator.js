// Admin Login credentials.
const adminLoginValidator = (email, password) => {
    const errors = {}

    if (!email || !email.trim()) {
        errors.email = "Email is required"
    }

    if (!password || !password.trim()) {
        errors.password = "Password is required"
    }

    return {
        errors,
        isValid: Object.keys(errors).length === 0
    }
}


//----------------------------------------------------------



//-----------------------------------------------------------
module.exports = adminLoginValidator