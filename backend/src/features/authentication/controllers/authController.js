const validateRegistration = require("../validators/registerValidator");
const { registerUser } = require("../services/authService");

const register = async (req, res) => {
    try
    {
        const validationError = validateRegistration(req.body || {});

        if (validationError) 
        {
            return res.status(400).json({
                success: false,
                message: validationError,
            });
        }

        const user = await registerUser(req.body);

        return res.status(201).json({
            success: true,
            message: "Registration successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
            },
        });
    } catch (error) {
        const statusCode =
        error.code === 11000 ? 409 :
        error.message === "Email already registered" ? 409 : 500;

        return res.status(statusCode).json({
            success: false,
            message:
                statusCode === 500 ? "Registration failed" : error.message,
        });
    }
};

module.exports = { register };