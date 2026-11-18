const express = require("express");
const { 
    register, 
    verifyEmailOTP,
    resendEmailOTP,
    login,
    googleLogin,
    logout,
    forgotPassword,
    verifyPasswordReset,
    resetPasswordController,
    refreshUserTokenController
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware")

const router = express.Router();

router
    .post("/register", register)
    .post("/verify-otp", verifyEmailOTP)
    .post("/resend-otp", resendEmailOTP)
    .post("/login", login)
    .post("/refresh", refreshUserTokenController)
    .post("/google-login", googleLogin)
    .post("/logout", logout)
    .post("/forgot-password", forgotPassword)
    .post("/verify-reset-otp", verifyPasswordReset)
    .post("/reset-password", resetPasswordController)

router.get("/profile", authMiddleware, (req, res) => {
    return res.status(200).json({
        success: true,
        message: "Authentication successful",
        user: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role
        }
    })
})

module.exports = router;