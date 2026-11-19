const mongoose = require("mongoose");

const emailChangeOTPSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    otpHash: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true,
        expires: 0
    },
    attempts: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model("EmailChangeOTP", emailChangeOTPSchema);