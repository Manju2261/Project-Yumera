const express = require("express");
const { 
    register, 
    verifyEmailOTP,
    resendEmailOTP 
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);
router.post("/verify-otp", verifyEmailOTP)
router.post("/resend-otp", resendEmailOTP)

module.exports = router;