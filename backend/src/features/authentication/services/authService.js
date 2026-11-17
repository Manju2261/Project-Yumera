const bcrypt = require("bcryptjs");
const User = require("../models/User");
const EmailOTP = require("../models/EmailOTP")
const crypto = require("crypto")
const emailTransporter = require("../../../config/email")
const jwt = require("jsonwebtoken")
const PasswordResetOTP =require("../models/PasswordResetOTP")

//------------------------------------------------

// Generates a secure random 6-digit OTP.
//Generate OTP

const generateOTP = () => {
    return crypto.randomInt(100000, 1000000).toString()
}

//------------------------------------------
// Hash OTP.

const hashOTP = async (otp) => {
    return await bcrypt.hash(otp,10)
}
const MAX_OTP_ATTEMPTS = 3;

//------------------------------------------
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

//----------------------------------------------------
// Sends the generated OTP to the user's email address using Nodemailer.

const sendOTPEmail = async (email, otp, subject = "YUMERA - Email Verification OTP") => {
    const isPasswordReset = subject.includes("Password Reset")

    const heading = isPasswordReset
        ? "Password Reset Request"
        : "Welcome to YUMERA!"

    const message = isPasswordReset
        ? "Use the OTP below to reset your YUMERA account password."
        : "Use the OTP below to verify your email address."

    await emailTransporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject,
        html: `
            <h2>${heading}</h2>
            <p>${message}</p>
            <h1>${otp}</h1>
            <p>This OTP is valid for 5 minutes.</p>
            <p>Please do not share this OTP with anyone.</p>
        `
    })
}

//--------------------------------------------------------
// Generates and Send OTP

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
    
    // Stores the OTP and removes it if sending the email fails.
    await storeOTP(normalizedEmail, otp, registrationData)
    try{
        await sendOTPEmail(normalizedEmail, otp)
    }catch(error) {
        await EmailOTP.deleteOne({email : normalizedEmail})
        throw new Error("Failed to send OTP email. Please try again")
    }
    
}


//------------------------------------------------------
// ResendOTP for a pending registration.

const resendOTP = async (email)=> {
    const normalizedEmail = email.trim().toLowerCase()
    const otpRecord = await EmailOTP.findOne({
        email : normalizedEmail
    })

    if(!otpRecord)
    {
        throw new Error("Registration session not found or expired. Please register again.")
    }

    if (otpRecord.expiresAt < new Date()) 
    {
        await EmailOTP.deleteOne({ email: normalizedEmail })
        throw new Error("Registration session not found or expired. Please register again.")
    }

    const otp = generateOTP()
    const otpHash = await hashOTP(otp)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000)
    
    try{
        await sendOTPEmail(normalizedEmail, otp)

        otpRecord.otpHash = otpHash
        otpRecord.expiresAt = expiresAt
        otpRecord.attempts = 0

        await otpRecord.save()
    }catch (error) 
    {
        console.error("Resend OTP Error:", error)
        throw new Error("Failed to resend OTP. Please try again.")
    }
}


//------------------------------------------------------
// Generate Password & Reset OTP 

const generatePasswordResetOTP = async (email) => {
    const normalizedEmail = email.trim().toLowerCase()
    const user = await User.findOne({ email: normalizedEmail })

    if (!user) 
    {
        return
    }

    // Prevent Google-created accounts from resetting passwords through YUMERA.
    if (user.authProvider === "google") 
    {
        throw new Error("This account was created using Google. Please manage your account through your Google Account.")
    }

    const previousRecord = await PasswordResetOTP.findOne({
        email: normalizedEmail
    }).lean()

    const otp = generateOTP()
    const otpHash = await hashOTP(otp)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

    await PasswordResetOTP.findOneAndUpdate(
        { email: normalizedEmail },
        {
            otpHash,
            expiresAt,
            isVerified: false,
            attempts: 0
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    )

    try 
    {
        await sendOTPEmail(
            normalizedEmail,
            otp,
            "YUMERA - Password Reset OTP"
        )
    } catch (error) 
    {
        if (previousRecord) 
        {
            await PasswordResetOTP.findOneAndUpdate(
                { email: normalizedEmail },
                {
                    otpHash: previousRecord.otpHash,
                    expiresAt: previousRecord.expiresAt,
                    isVerified: previousRecord.isVerified,
                    attempts: previousRecord.attempts
                }
            )
        } else {
            await PasswordResetOTP.deleteOne({ email: normalizedEmail })
        }

        throw new Error("Failed to send password reset OTP. Please try again.")
    }
}


//------------------------------------------------------
// Verify password reset OTP 

const verifyPasswordResetOTP = async (email, enteredOTP) => {
    const normalizedEmail = email.trim().toLowerCase()
    const otpRecord = await PasswordResetOTP.findOne({
        email: normalizedEmail
    })

    if (!otpRecord) 
    {
        throw new Error("Password reset OTP not found or expired")
    }

    if(otpRecord.isVerified)
    {
        throw new Error("OTP has already been verified. Please reset your password.")
    }

    if (otpRecord.expiresAt < new Date()) 
    {
        await PasswordResetOTP.deleteOne({ email: normalizedEmail })
        throw new Error("OTP has expired. Please request a new OTP.")
    }

    if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) 
    {
        await PasswordResetOTP.deleteOne({ email: normalizedEmail })
        throw new Error("Maximum OTP attempts reached. Please request a new OTP.")
    }

    const isOTPValid = await bcrypt.compare(enteredOTP, otpRecord.otpHash)

    if (!isOTPValid) 
    {
        otpRecord.attempts += 1

        if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) 
        {
            await PasswordResetOTP.deleteOne({ email: normalizedEmail })
            throw new Error("Maximum OTP attempts reached. Please request a new OTP.")
        }

        await otpRecord.save()
        throw new Error("Invalid OTP")
    }

    otpRecord.isVerified = true
    await otpRecord.save()
    return true
}


//-----------------------------------------------------

//Update User's Password after OTP verification

const resetPassword = async (email, newPassword) => {
    const normalizedEmail = email.trim().toLowerCase()
    const otpRecord = await PasswordResetOTP.findOne({
        email: normalizedEmail
    })

    if (!otpRecord || !otpRecord.isVerified) {
        throw new Error("Please verify your password reset OTP first")
    }

    if (otpRecord.expiresAt < new Date()) {
        await PasswordResetOTP.deleteOne({ email: normalizedEmail })
        throw new Error("Password reset session has expired. Please request a new OTP.")
    }

    // Prevent Google accounts from changing passwords through YUMERA.
    const user = await User.findOne({ email: normalizedEmail })

    if(!user)
    {
        throw new Error("User not found")
    }

    if (user.authProvider === "google") 
    {
        throw new Error("This account was created using Google. Please manage your account through your Google Account.")
    }

    const passwordHash = await bcrypt.hash(newPassword, 12)
    user.password = passwordHash
    await user.save()

    await PasswordResetOTP.deleteOne({ email: normalizedEmail })

    return true
}


//------------------------------------------------------
// Verify OTP, checks expiration and blocks after 3 incorrect attempts.

const verifyOTP = async (email, enteredOTP) => {
    const normalizedEmail = email.trim().toLowerCase()
    const otpRecord = await EmailOTP.findOne({ email : normalizedEmail })

    if (!otpRecord) 
    {
        throw new Error("OTP not found or expired")
    }

    // Checks whether the registration OTP has expired.
    if (otpRecord.expiresAt < new Date()) 
    {
        await EmailOTP.deleteOne({ email: normalizedEmail })
        throw new Error("OTP has expired. Please request a new OTP.")
    }

    if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) 
    {
        throw new Error("Maximum OTP attempts exceeded. Please request a new OTP.")
    }

    const isMatch = await bcrypt.compare(enteredOTP, otpRecord.otpHash)

    if (!isMatch) 
    {
        otpRecord.attempts += 1

        if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) 
        {
            await EmailOTP.deleteOne({ email: normalizedEmail })
            throw new Error("Maximum OTP attempts exceeded. Please request a new OTP.")
        }

        await otpRecord.save()
        throw new Error("Invalid OTP")
    }

    // Delete used OTP & returns the details.
    const registrationData = otpRecord.registrationData
    await EmailOTP.deleteOne({email : normalizedEmail})
    return registrationData
}


// -------------------------------------------------
//RegisterUser

const registerUser = async (userData) => {
    const { name, email, phone, passwordHash } = userData;

    // Normalizes the email before checking for an existing account.
    const normalizedEmail = email.trim().toLowerCase()
    const existingUser = await User.findOne({ email: normalizedEmail })

    if (existingUser) 
    {
        throw new Error("Email already registered")
    }

    // Creates a verified user after successful email OTP verification.
    const user = await User.create({
        name,
        email : normalizedEmail,
        phone,
        password : passwordHash,
        isVerified : true
    });

    return user;
};

    
// -------------------------------------------------
//Generates a JWT token after successful login.

const loginUser = async (email, password) => {
    const normalizedEmail = email.trim().toLowerCase()
    const user = await User.findOne({ email: normalizedEmail }).select("+password")
    
    if (!user) 
    {
        throw new Error("Invalid email or password")
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password)

    if (!isPasswordMatch) 
    {
        throw new Error("Invalid email or password")
    }

    const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    )
    return { user, token }
}

//--------------------------------------------------

module.exports = { 
    registerUser,
    generateAndSendOTP, 
    verifyOTP,
    resendOTP,
    loginUser,
    generatePasswordResetOTP,
    verifyPasswordResetOTP,
    resetPassword
 };