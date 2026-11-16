const validateRegistration = require("../validators/registerValidator");
const { registerUser, 
        generateAndSendOTP,
        verifyOTP,
} = require("../services/authService");

//................................................

//Register Control

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

        // Sends an OTP instead of creating the user immediately.

        await generateAndSendOTP(req.body.email, req.body)
        return res.status(200).json({
            success: true,
            message: "OTP sent to your email. Please verify your email to complete registration"
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


//..............................................................

// Verifies the OTP entered by the user.

const verifyEmailOTP = async (req, res) => {
    try 
    {
        const {email, otp} = req.body

        // Checks whether email and OTP are provided in the request.
        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required"
            })
        }

        // Ensures that the OTP contains exactly 6 digits.
        if (!/^\d{6}$/.test(otp)) {
            return res.status(400).json({
                success: false,
                message: "OTP must contain exactly 6 digits"
            })
        }
        
        // Verifies OTP and creates the user only after successful email verification.
        
        const registrationData = await verifyOTP(email, otp)

        const user = await registerUser({
            ...registrationData,
            email
        })

        return res.status(201).json({
            success: true,
            message: "Registration successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        })
    }catch (error)
    {
        // Returns 409 for duplicate emails and 400 for other verification errors.
        const statusCode = error.message === "Email already registered" ? 409 : 400

        return res.status(statusCode).json({
            success: false,
            message: error.message
        })
    }
}

//.....................................................

module.exports = { 
    register,
    verifyEmailOTP 
};