const mongoose = require("mongoose")
const emailOTPSchema = new mongoose.Schema(
    {
        email : {
            type : String,
            required : true,
            lowercase : true,
            trim : true,
        },

        otpHash : {
            type : String,
            required : true,
        },

        expireAt : {
            type : Date,
            required : true,
            index : {expires : 0},
        },

        attempts : {
            type : Number,
            default : 0,
        },

        //Temporarily stores registration details until email verification is completed.
        registrationData : 
        {
            name : String,
            phone : String,
            passwordHash : String
        }
    },
    {timestamps : true}
)
module.exports = mongoose.model("EmailOTP", emailOTPSchema)