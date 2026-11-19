
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        
        phone: {
            type: String,
            required: function () {
                return this.authProvider === "local"
            },
            trim: true,
        },

        password: {
            type: String,
            required: function () {
                return this.authProvider === "local"
            },
            select: false,
        },

        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },

        isBlocked : {
            type : Boolean,
            default : false
        },

        isVerified: {
            type: Boolean,
            default: false,
        },

        authProvider: {
            type: String,
            enum: ["local", "google"],
            default: "local"
        },

        refreshTokenHash: 
        {
            type: String,
            default: null,
            select: false
        },

        profileImageKey: {
            type: String,
            default: null
        },

        addresses: [
            {
                fullName: {
                    type: String,
                    trim: true,
                },
                phone: {
                    type: String,
                    trim: true,
                },
                addressLine: {
                    type: String,
                    trim: true,
                },
                city: {
                    type: String,
                    trim: true,
                },
                state: {
                    type: String,
                    trim: true,
                },
                pincode: {
                    type: String,
                    trim: true,
                },
                isDefault: {
                    type: Boolean,
                    default: false,
                },
            },
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
