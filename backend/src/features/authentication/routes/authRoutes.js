const express = require("express");
const { 
    register, 
    verifyEmailOTP,
    resendEmailOTP,
    login,
    logout,
    forgotPassword,
    verifyPasswordReset,
    resetPasswordController
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware")

const router = express.Router();

router.post("/register", register);
router.post("/verify-otp", verifyEmailOTP)
router.post("/resend-otp", resendEmailOTP)
router.post("/login", login)
router.post("/logout", logout)
router.post("/forgot-password", forgotPassword)
router.post("/verify-reset-otp", verifyPasswordReset)
router.post("/reset-password", resetPasswordController)

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