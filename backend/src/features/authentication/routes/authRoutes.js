const express = require("express");
const { register, verifyEmailOTP } = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);
router.post("/verify-otp", verifyEmailOTP)

module.exports = router;