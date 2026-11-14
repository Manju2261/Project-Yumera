const bcrypt = require("bcryptjs");
const User = require("../models/User");

const registerUser = async (userData) => {
    const { name, email, phone, password } = userData;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new Error("Email already registered");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
        name,
        email,
        phone,
        password: hashedPassword,
    });

    return user;
};

module.exports = { registerUser };