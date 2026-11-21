const validateRegistration = require("../validators/registerValidator");
const { registerUser, 
        generateEmailChangeOTP,
        generateAndSendOTP,
        verifyEmailChangeOTP,
        verifyOTP,
        resendOTP,
        loginUser,
        generatePasswordResetOTP,
        verifyPasswordResetOTP,
        resetPassword,
        loginWithGoogle,
        refreshUserAccessToken,
        logoutUser,
        changePasswordService
} = require("../services/authService");

const validateLogin = require("../validators/loginValidator")


//-------------------------------------------------------
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


//--------------------------------------------------------
// Verify Email OTP 

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
        // Handles MongoDB duplicate key error (11000) duplicate email(409), client-side and unexpected server errors.
        const statusCode = 
            error.code === 11000 ? 409 :
            error.message === "OTP not found or expired" ||
            error.message === "OTP has expired. Please request a new OTP."||
            error.message === "Invalid OTP" ||
            error.message === "Maximum OTP attempts exceeded. Please request a new OTP." ? 400 : 500

        return res.status(statusCode).json({
            success: false,
            message: statusCode === 500 ? "Email verification failed" : error.message
        })
    }
}


//--------------------------------------------------------------
// Resend Email OTP.

const resendEmailOTP = async(req, res) => {
    try{
        const {email} = req.body
        if(!email)
        {
            return res.status(400).json({
                success : false,
                message : "Email is required"
            })
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

        if (!emailRegex.test(email.trim())) 
        {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address"
            })
        }

        await resendOTP(email)
        return res.status(200).json({
            success : true,
            message : "A new OTP has been sent to your email"
        })
    } catch (error) 
    {
        if (error.message === "Registration session not found or expired. Please register again.") 
        {
            return res.status(404).json({
                success: false,
                message: error.message
            })
        }

        return res.status(500).json({
            success: false,
            message: "Failed to resend OTP. Please try again later."
        })
    }
}


//------------------------------------------------------------------
// Send Email Change OTP

const requestEmailChangeController = async (req, res) => {
    try {
        const { newEmail } = req.body;

        if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail.trim())) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email"
            });
        }

        await generateEmailChangeOTP(req.user._id, newEmail);

        return res.status(200).json({
            success: true,
            message: "OTP sent to your new email"
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


//-----------------------------------------------------------------
// Verify Email Change OTP

const verifyEmailChangeController = async (req, res) => {
    try {
        const { otp } = req.body;

        if (!otp || !/^\d{6}$/.test(otp)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid 6-digit OTP"
            });
        }

        const user = await verifyEmailChangeOTP(req.user._id, otp);

        return res.status(200).json({
            success: true,
            message: "Email updated successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


//--------------------------------------------------------
//Forgot Password -  requests and sends a reset OTP

const forgotPassword = async (req, res) => {
    try 
    {
        const { email } = req.body

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) 
        {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address"
            })
        }

        await generatePasswordResetOTP(email)

        return res.status(200).json({
            success: true,
            message: "If the email is registered, a password reset OTP has been sent"
        })
    } catch (error) 
    {
        if (error.message === "This account was created using Google. Please manage your account through your Google Account.") 
        {
            return res.status(400).json({
                success: false,
                message: error.message
            })
        }

        return res.status(500).json({
            success: false,
            message: "Unable to process password reset request"
        })
    }
}



//--------------------------------------------------------
//Verify OTP - Password Reset

const verifyPasswordReset = async (req, res) => {
    try 
    {
        const { email, otp } = req.body
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !otp || !/^\d{6}$/.test(otp))
        {
            return res.status(400).json({
                success: false,
                message: "Valid email and 6-digit OTP are required"
            })
        }
        await verifyPasswordResetOTP(email, otp)
        return res.status(200).json({
            success: true,
            message: "OTP verified successfully"
        })
    } catch (error) 
    {
        const clientErrors = [
            "Password reset OTP not found or expired",
            "OTP has expired. Please request a new OTP.",
            "Maximum OTP attempts reached. Please request a new OTP.",
            "Invalid OTP",
            "OTP has already been verified. Please reset your password."
        ]

        if (clientErrors.includes(error.message)) {
            return res.status(400).json({
                success: false,
                message: error.message
            })
        }

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}


//---------------------------------------------------------------
//Password Reset after OTP verification.

const  resetPasswordController = async (req, res) => {
    try {
        const { email, newPassword } = req.body

        if (!email || !newPassword || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) 
        {
            return res.status(400).json({
                success: false,
                message: "Valid email and new password are required"
            })
        }

        if (typeof newPassword !== "string" || newPassword.length < 8) 
        {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters long"
            })
        }

        await resetPassword(email, newPassword)

        return res.status(200).json({
            success: true,
            message: "Password reset successful. Please login with your new password."
        })
    } catch (error) 
    {
        const clientErrors = [
            "Please verify your password reset OTP first",
            "Password reset session has expired. Please request a new OTP.",
            "User not found",
            "This account was created using Google. Please manage your account through your Google Account."
        ]

        if(clientErrors.includes(error.message)) {
            return res.status(400).json({
                success: false,
                message: error.message
            })
        }

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}


//--------------------------------------------------------------
// Change Password

// Change Password
const changePasswordController = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword || newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Current password and a new password of at least 8 characters are required"
            });
        }

        await changePasswordService(
            req.user._id,
            currentPassword,
            newPassword
        );

        return res.status(200).json({
            success: true,
            message: "Password changed successfully. Please login again."
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


//---------------------------------------------------------------
//Login - Local User and sends the JWT through a secure HttpOnly cookie.

const login = async (req, res) => {
    try 
    {
        const validationError = validateLogin(req.body || {})
        if (validationError) 
        {
            return res.status(400).json({
                success: false,
                message: validationError
            })
        }

        const { email, password } = req.body
        const { user, token, refreshToken } = await loginUser(email, password)

        // Stores the Access Token in an HttpOnly cookie.
        res.cookie("accessToken", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 15 * 60 * 1000
        })

        // Stores the Refresh Token in an HttpOnly cookie.
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        return res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        })
    } catch (error) 
    {
        if (error.message === "Invalid email or password") 
        {
            return res.status(401).json({
                success: false,
                message: error.message
            })
        }

        if (
            error.message === "This account was created using Google. Please login using Google."
        ) {
            return res.status(400).json({
                success: false,
                message: error.message
            })
        }

        if (error.message === "Your account has been blocked. Please contact support.") 
        {
            return res.status(403).json({
                success: false,
                message: error.message
            })
        }

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}


//------------------------------------------------------------------
//Login - Google User

const googleLogin = async (req, res) => {
    try {
        const { idToken } = req.body

        if (!idToken) {
            return res.status(400).json({
                success: false,
                message: "Google ID token is required"
            })
        }

        const { user, accessToken, refreshToken } =
            await loginWithGoogle(idToken)

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 15 * 60 * 1000
        })

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        return res.status(200).json({
            success: true,
            message: "Google login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        })
    } catch (error) {
        if (
            error.message === "This email is already registered. Please login using your email and password."
        ) {
            return res.status(409).json({
                success: false,
                message: error.message
            })
        }

        if (
            error.message === "Your account has been blocked. Please contact support."
        ) {
            return res.status(403).json({
                success: false,
                message: error.message
            })
        }

        if (error.message === "Google email is not verified") {
            return res.status(401).json({
                success: false,
                message: error.message
            })
        }

        console.error("Google Login Error:", error)

        return res.status(401).json({
            success: false,
            message: "Google authentication failed"
        })
    }
}



//--------------------------------------------------------
//Logout the user

const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies?.refreshToken

        await logoutUser(refreshToken)

        res.clearCookie("accessToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax"
        })

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax"
        })

        return res.status(200).json({
            success: true,
            message: "Logged out successfully"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Logout failed"
        })
    }
}


//--------------------------------------------------------
// Generates a new Access Token using the Refresh Token cookie.

const refreshUserTokenController = async (req, res) => {
    try {
        const refreshToken = req.cookies?.refreshToken

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Refresh token required. Please login again."
            })
        }

        const { accessToken, refreshToken: newRefreshToken } =
            await refreshUserAccessToken(refreshToken)

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 15 * 60 * 1000
        })

        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        return res.status(200).json({
            success: true,
            message: "Access and refresh tokens refreshed successfully"
        })
    } catch (error) {
        console.error("Refresh Token Error:", error)
        return res.status(401).json({
            success: false,
            message: "Invalid or expired refresh token. Please login again."
        })
    }
}


//--------------------------------------------------------
module.exports = { 
    register,
    verifyEmailOTP,
    resendEmailOTP,
    login,
    googleLogin,
    logout,
    forgotPassword,
    verifyPasswordReset,
    resetPasswordController,
    refreshUserTokenController,
    requestEmailChangeController,
    verifyEmailChangeController,
    changePasswordController
};