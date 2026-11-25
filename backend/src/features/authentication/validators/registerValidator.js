// Validates the user registration details.
const validateRegistration = ({ name, email, phone, password }) => {
    if (!name || !email || !phone || !password) {
        return "All fields are required"
    }

    const trimmedName = name.trim()
    if (trimmedName.length < 2 || trimmedName.length > 50) {
        return "Name must be between 2 and 50 characters"
    }

    if (!/^[A-Za-z\s]+$/.test(trimmedName)) {
        return "Name should contain only letters"
    }

    const trimmedPhone = phone.toString().trim()
    if (!/^[6-9]\d{9}$/.test(trimmedPhone)) {
        return "Phone number must be a valid 10-digit Indian number starting with 6-9"
    }

    const trimmedEmail = email.trim()
    if (!/^[a-zA-Z]/.test(trimmedEmail)) {
        return "Email must start with a letter"
    }
    if (!/^[a-zA-Z][a-zA-Z0-9._%+-]{4,}@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(trimmedEmail)) {
        return "Email must have at least 5 characters before @ and be a valid format"
    }

    // Checks password length (8-30 chars), uppercase letter, number and special symbol
    if (
        password.length < 8 ||
        password.length > 30 ||
        !/[A-Z]/.test(password) ||
        !/[0-9]/.test(password) ||
        !/[^A-Za-z0-9]/.test(password)
    ) {
        return "Password must be between 8 and 30 characters and contain at least one uppercase letter, one number, and one special symbol"
    }
    return null
}

module.exports = validateRegistration