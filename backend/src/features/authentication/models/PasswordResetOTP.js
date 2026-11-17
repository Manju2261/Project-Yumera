const mongoose = require("mongoose")

const passwordResetOTPSchema = new mongoose.Schema(
    {
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
            index: { expires: 0 }
        },
        attempts: {
            type: Number,
            default: 0
        },
        isVerified : {
            type : Boolean,
            default : false
        }
    },
    { timestamps: true }
)
module.exports = mongoose.model("PasswordResetOTP", passwordResetOTPSchema)