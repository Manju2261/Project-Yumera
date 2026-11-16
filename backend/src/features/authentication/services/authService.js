const bcrypt = require("bcryptjs");
const User = require("../models/User");
const EmailOTP = require("../models/EmailOTP")
const crypto = require("crypto")
const emailTransporter = require("../../../config/email")

//------------------------------------------------

// Generates a secure random 6-digit OTP.

const generateOTP = () => {
    return crypto.randomInt(100000, 1000000).toString()
}


// Hash OTP.

const hashOTP = async (otp) => {
    return await bcrypt.hash(otp,10)
}
const MAX_OTP_ATTEMPTS = 3;


// Store the hashed OTP & expiration time in MongoDB

const storeOTP = async (email, otp, registrationData) => {
    const otpHash = await hashOTP(otp)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

    await EmailOTP.findOneAndUpdate(
        {email}, 
        {
            otpHash,
            expiresAt,
            attempts : 0,
            registrationData,
        },
        {upsert : true, new : true}
    )
}


// Sends the generated OTP to the user's email address using Nodemailer.

const sendOTPEmail = async(email, otp) => {
    await emailTransporter.sendMail({
        from : process.env.EMAIL_USER,
        to : email,
        subject : "YUMERA - Email Verification OTP",
        html : `
                    <h2>Welcome to YUMERA!</h2>
                    <p>Your email verification OTP is:</p>
                    <h1>${otp}</h1>
                    <p>This OTP is valid for 5 minutes.</p>
                    <p>Please do not share this OTP with anyone.</p>
                `,
    })
}


// Generates an OTP, stores its hashed value in MongoDB, and send to the user's email.

const generateAndSendOTP = async(email, userData) => {
    // Normalizes the email before checking for an existing account.
    const normalizedEmail = email.trim().toLowerCase()
    const existingUser = await User.findOne({ email: normalizedEmail })

    if (existingUser) {
        throw new Error("Email already registered")
    }
    const otp = generateOTP()
    const passwordHash = await bcrypt.hash(userData.password, 12)
    const registrationData = {
        name : userData.name,
        phone : userData.phone,
        passwordHash
    }
    
    await storeOTP(normalizedEmail, otp, registrationData)
    await sendOTPEmail(normalizedEmail, otp)
}


//------------------------------------------------------

// Verify OTP, checks expiration and blocks after 3 incorrect attempts.

const verifyOTP = async (email, enteredOTP) => {
    const otpRecord = await EmailOTP.findOne({ email })

    if (!otpRecord) 
    {
        throw new Error("OTP not found or expired")
    }

    if (otpRecord.expiresAt < new Date()) 
    {
        await EmailOTP.deleteOne({ email })
        throw new Error("OTP has expired")
    }

    if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) 
    {
        throw new Error("Maximum OTP attempts exceeded. Please request a new OTP.")
    }

    const isMatch = await bcrypt.compare(enteredOTP, otpRecord.otpHash)

    if (!isMatch) 
    {
        otpRecord.attempts += 1
        await otpRecord.save()

        throw new Error("Invalid OTP")
    }

    // Delete used OTP & returns the details.
    const registrationData = otpRecord.registrationData
    await EmailOTP.deleteOne({email})
    return registrationData
}


// -------------------------------------------------

const registerUser = async (userData) => {
    const { name, email, phone, passwordHash } = userData;

    // Normalizes the email before checking for an existing account.
    const normalizedEmail = email.trim().toLowerCase()
    const existingUser = await User.findOne({ email: normalizedEmail })

    if (existingUser) 
    {
        throw new Error("Email already registered")
    }

    const user = await User.create({
        name,
        email : normalizedEmail,
        phone,
        password : passwordHash
    });

    return user;
};

//--------------------------------------------------

module.exports = { 
    registerUser,
    generateAndSendOTP, 
    verifyOTP    
 };