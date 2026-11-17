// Validates the email and password received during login.

const validateLogin = ({email, password}) => {
    if (typeof email !== "string" || !email.trim() || typeof password !== "string" || !password)
    {
        return "Email and Password are required"
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        return "Invalid email address"
    }
    return null
}
module.exports = validateLogin