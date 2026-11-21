const validateRegistration = ({ name, email, phone, password }) => {
    if (!name || !email || !phone || !password) {
        return "All fields are required";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) 
    {
        return "Invalid email address"
    }

    if (password.length < 8) {
        return "Password must be at least 8 characters";
    }

    return null;
};

module.exports = validateRegistration;