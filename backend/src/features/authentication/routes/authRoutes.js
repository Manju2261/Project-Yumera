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
    refreshUserTokenController,
    requestCurrentEmailChangeOTPController,
    verifyCurrentEmailChangeOTPController,
    requestNewEmailChangeOTPController,
    verifyNewEmailChangeOTPController,
    changePasswordController
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware")
const { getUserProfileImageUrlService } = require("../../user/userServices/userS3Service")

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
    .post("/change-email/request-current", authMiddleware, requestCurrentEmailChangeOTPController)
    .post("/change-email/verify-current", authMiddleware, verifyCurrentEmailChangeOTPController)
    .post("/change-email/request-new", authMiddleware, requestNewEmailChangeOTPController)
    .post("/change-email/verify-new", authMiddleware, verifyNewEmailChangeOTPController)

router.patch(
    "/change-password",
    authMiddleware,
    changePasswordController
);

router.get("/profile", authMiddleware, async (req, res) => {
    try {
        const profileImageUrl = await getUserProfileImageUrlService(
            req.user.profileImageKey
        )
        return res.status(200).json({
            success: true,
            message: "Authentication successful",
            user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role,
                authProvider: req.user.authProvider,
                profileImageUrl
            }
        })
    } catch {
        return res.status(200).json({
            success: true,
            message: "Authentication successful",
            user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role,
                authProvider: req.user.authProvider,
                profileImageUrl: null
            }
        })
    }
})

module.exports = router;