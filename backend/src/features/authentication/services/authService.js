const bcrypt = require("bcryptjs");
const User = require("../models/User");
const EmailOTP = require("../models/EmailOTP")
const crypto = require("crypto")
const emailTransporter = require("../../../config/email")
const jwt = require("jsonwebtoken")
const PasswordResetOTP = require("../models/PasswordResetOTP")
const { OAuth2Client } = require("google-auth-library")
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
const EmailChangeOTP = require("../models/EmailChangeOTP");

//------------------------------------------------

//Generate OTP

const generateOTP = () => {
    return crypto.randomInt(100000, 1000000).toString()
}

//------------------------------------------
// Hash OTP.

const hashOTP = async (otp) => {
    return await bcrypt.hash(otp, 10)
}
const MAX_OTP_ATTEMPTS = 3;

//------------------------------------------
// Store the hashed OTP & expiration time in MongoDB

const storeOTP = async (email, otp, registrationData) => {
    const otpHash = await hashOTP(otp)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

    await EmailOTP.findOneAndUpdate(
        { email },
        {
            otpHash,
            expiresAt,
            attempts: 0,
            registrationData,
        },
        { upsert: true, new: true }
    )
}

//----------------------------------------------------
// Sends the generated OTP to the user's email address using Nodemailer.

const sendOTPEmail = async (email, otp, subject = "YUMERA - Email Verification OTP") => {
    const isPasswordReset = subject.includes("Password Reset")
    const isEmailChange = subject.includes("Email Change")

    const heading = isPasswordReset
        ? "Password Reset Request"
        : isEmailChange
            ? "Email Change Verification"
            : "Welcome to YUMERA!"

    const message = isPasswordReset
        ? "Use the OTP below to reset your YUMERA account password."
        : isEmailChange
            ? "Use the OTP below to verify your new email address."
            : "Use the OTP below to verify your email address."

    // Sends the OTP email and logs the SMTP delivery response.
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


//----------------------------------------------------------------
//generate Email Change OTP

// Step 1: Send OTP to Current Email
const generateCurrentEmailOTP = async (userId) => {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");
    if (user.authProvider === "google") {
        throw new Error("Google accounts cannot change email");
    }

    const otp = generateOTP();
    const otpHash = await hashOTP(otp);

    await EmailChangeOTP.deleteMany({ userId });

    await EmailChangeOTP.create({
        userId,
        email: user.email,
        otpHash,
        stage: "CURRENT_EMAIL",
        expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    });

    try {
        await sendOTPEmail(
            user.email,
            otp,
            "YUMERA - Step 1: Verify Current Email",
            "Verify Current Email",
            "You requested to change your email address. Please enter the OTP below to verify your current account ownership:"
        );
    } catch (error) {
        await EmailChangeOTP.deleteOne({ userId });
        throw error;
    }
};

// Step 2: Verify Current Email OTP
const verifyCurrentEmailOTP = async (userId, otp) => {
    const otpData = await EmailChangeOTP.findOne({ userId, stage: "CURRENT_EMAIL" });
    if (!otpData) throw new Error("Verification session expired. Please try again.");
    if (otpData.expiresAt < new Date()) throw new Error("OTP has expired");
    if (otpData.attempts >= MAX_OTP_ATTEMPTS) throw new Error("Maximum OTP attempts exceeded");

    const isMatch = await bcrypt.compare(otp, otpData.otpHash);
    if (!isMatch) {
        otpData.attempts += 1;
        await otpData.save();
        throw new Error("Invalid OTP");
    }

    // Mark current email as verified
    otpData.stage = "NEW_EMAIL";
    otpData.expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins to enter new email
    await otpData.save();

    return true;
};

// Step 3: Send OTP to New Email
const generateNewEmailOTP = async (userId, newEmail) => {
    newEmail = newEmail.trim().toLowerCase();
    const otpData = await EmailChangeOTP.findOne({ userId, stage: "NEW_EMAIL" });
    if (!otpData) throw new Error("Please verify your current email first.");

    const existingUser = await User.findOne({ email: newEmail });
    if (existingUser) throw new Error("This email is already in use by another account");

    const otp = generateOTP();
    const otpHash = await hashOTP(otp);

    otpData.email = newEmail;
    otpData.otpHash = otpHash;
    otpData.attempts = 0;
    otpData.expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await otpData.save();

    await sendOTPEmail(
        newEmail,
        otp,
        "YUMERA - Step 2: Confirm New Email",
        "Confirm New Email",
        "Please enter the OTP below to confirm and activate this new email address:"
    );
};

// Step 4: Verify New Email OTP and Update User
const verifyNewEmailOTP = async (userId, otp) => {
    const otpData = await EmailChangeOTP.findOne({ userId, stage: "NEW_EMAIL" });
    if (!otpData) throw new Error("Session expired. Please start over.");
    if (otpData.expiresAt < new Date()) throw new Error("OTP has expired");
    if (otpData.attempts >= MAX_OTP_ATTEMPTS) throw new Error("Maximum OTP attempts exceeded");

    const isMatch = await bcrypt.compare(otp, otpData.otpHash);
    if (!isMatch) {
        otpData.attempts += 1;
        await otpData.save();
        throw new Error("Invalid OTP");
    }

    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const existingUser = await User.findOne({ email: otpData.email, _id: { $ne: userId } });
    if (existingUser) throw new Error("Email already in use");

    user.email = otpData.email;
    await user.save();

    await EmailChangeOTP.deleteOne({ userId });
    return user;
};

//--------------------------------------------------------
// Generates and Send OTP

const generateAndSendOTP = async (email, userData) => {
    // Normalizes the email before checking for an existing account.
    const normalizedEmail = email.trim().toLowerCase()
    const existingUser = await User.findOne({ email: normalizedEmail })

    if (existingUser) {
        throw new Error("Email already registered")
    }
    const otp = generateOTP()
    const passwordHash = await bcrypt.hash(userData.password, 12)
    const registrationData = {
        name: userData.name,
        phone: userData.phone,
        passwordHash
    }

    // Stores the OTP and removes it if sending the email fails.
    await storeOTP(normalizedEmail, otp, registrationData)
    try {
        await sendOTPEmail(normalizedEmail, otp)
    } catch (error) {
        await EmailOTP.deleteOne({ email: normalizedEmail })
        throw new Error("Failed to send OTP email. Please try again")
    }

}


//------------------------------------------------------
// ResendOTP for a pending registration.

const resendOTP = async (email) => {
    const normalizedEmail = email.trim().toLowerCase()
    const otpRecord = await EmailOTP.findOne({
        email: normalizedEmail
    })

    if (!otpRecord) {
        throw new Error("Registration session not found or expired. Please register again.")
    }

    if (otpRecord.expiresAt < new Date()) {
        await EmailOTP.deleteOne({ email: normalizedEmail })
        throw new Error("Registration session not found or expired. Please register again.")
    }

    const otp = generateOTP()
    const otpHash = await hashOTP(otp)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

    try {
        await sendOTPEmail(normalizedEmail, otp)

        otpRecord.otpHash = otpHash
        otpRecord.expiresAt = expiresAt
        otpRecord.attempts = 0

        await otpRecord.save()
    } catch (error) {
        console.error("Resend OTP Error:", error)
        throw new Error("Failed to resend OTP. Please try again.")
    }
}


//------------------------------------------------------
// Generate Password & Reset OTP 

const generatePasswordResetOTP = async (email) => {
    const normalizedEmail = email.trim().toLowerCase()
    const user = await User.findOne({ email: normalizedEmail })

    if (!user) {
        return
    }

    // Prevent Google-created accounts from resetting passwords through YUMERA.
    if (user.authProvider === "google") {
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

    try {
        await sendOTPEmail(
            normalizedEmail,
            otp,
            "YUMERA - Password Reset OTP"
        )
    } catch (error) {
        if (previousRecord) {
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

    if (!otpRecord) {
        throw new Error("Password reset OTP not found or expired")
    }

    if (otpRecord.isVerified) {
        throw new Error("OTP has already been verified. Please reset your password.")
    }

    if (otpRecord.expiresAt < new Date()) {
        await PasswordResetOTP.deleteOne({ email: normalizedEmail })
        throw new Error("OTP has expired. Please request a new OTP.")
    }

    if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
        await PasswordResetOTP.deleteOne({ email: normalizedEmail })
        throw new Error("Maximum OTP attempts reached. Please request a new OTP.")
    }

    const isOTPValid = await bcrypt.compare(enteredOTP, otpRecord.otpHash)

    if (!isOTPValid) {
        otpRecord.attempts += 1

        if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
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

    if (!user) {
        throw new Error("User not found")
    }

    if (user.authProvider === "google") {
        throw new Error("This account was created using Google. Please manage your account through your Google Account.")
    }

    // Validates the new password requirements
    if (
        newPassword.length < 8 ||
        !/[A-Z]/.test(newPassword) ||
        !/[0-9]/.test(newPassword) ||
        !/[^A-Za-z0-9]/.test(newPassword)
    ) {
        throw new Error("Password must contain at least 8 characters, one uppercase letter, one number and one special symbol")
    }

    const passwordHash = await bcrypt.hash(newPassword, 12)
    user.password = passwordHash
    user.refreshTokenHash = null
    await user.save()

    await PasswordResetOTP.deleteOne({ email: normalizedEmail })

    return true
}


//------------------------------------------------------
// Verify OTP, checks expiration and blocks after 3 incorrect attempts.

const verifyOTP = async (email, enteredOTP) => {
    const normalizedEmail = email.trim().toLowerCase()
    const otpRecord = await EmailOTP.findOne({ email: normalizedEmail })

    if (!otpRecord) {
        throw new Error("OTP not found or expired")
    }

    // Checks whether the registration OTP has expired.
    if (otpRecord.expiresAt < new Date()) {
        await EmailOTP.deleteOne({ email: normalizedEmail })
        throw new Error("OTP has expired. Please request a new OTP.")
    }

    if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
        throw new Error("Maximum OTP attempts exceeded. Please request a new OTP.")
    }

    const isMatch = await bcrypt.compare(enteredOTP, otpRecord.otpHash)

    if (!isMatch) {
        otpRecord.attempts += 1

        if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
            await EmailOTP.deleteOne({ email: normalizedEmail })
            throw new Error("Maximum OTP attempts exceeded. Please request a new OTP.")
        }

        await otpRecord.save()
        throw new Error("Invalid OTP")
    }

    // Delete used OTP & returns the details.
    const registrationData = otpRecord.registrationData
    await EmailOTP.deleteOne({ email: normalizedEmail })
    return registrationData
}


// -------------------------------------------------
//RegisterUser

const registerUser = async (userData) => {
    const { name, email, phone, passwordHash } = userData;

    // Normalizes the email before checking for an existing account.
    const normalizedEmail = email.trim().toLowerCase()
    const existingUser = await User.findOne({ email: normalizedEmail })

    if (existingUser) {
        throw new Error("Email already registered")
    }

    // Creates a verified user after successful email OTP verification.
    const user = await User.create({
        name,
        email: normalizedEmail,
        phone,
        password: passwordHash,
        isVerified: true
    });

    return user;
};



// -----------------------------------------------------
//Verify Google ID Token

const verifyGoogleToken = async (idToken) => {
    const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID
    })

    const payload = ticket.getPayload()

    return {
        googleId: payload.sub,
        name: payload.name,
        email: payload.email,
        isVerified: payload.email_verified,
        picture: payload.picture
    }
}


// -------------------------------------------------
//Login with Google

const loginWithGoogle = async (idToken) => {
    const googleUser = await verifyGoogleToken(idToken)

    if (!googleUser.isVerified) {
        throw new Error("Google email is not verified")
    }

    const normalizedEmail = googleUser.email.trim().toLowerCase()
    let user = await User.findOne({ email: normalizedEmail })

    if (user && user.authProvider !== "google") {
        throw new Error(
            "This email is already registered. Please login using your email and password."
        )
    }

    if (user && user.isBlocked) {
        throw new Error(
            "Your account has been blocked. Please contact support."
        )
    }

    if (!user) {
        user = await User.create({
            name: googleUser.name,
            email: normalizedEmail,
            authProvider: "google",
            isVerified: true
        })
    }

    const accessToken = generateAccessToken(user._id)
    const refreshToken = generateRefreshToken(user._id)

    user.refreshTokenHash = hashRefreshToken(refreshToken)
    await user.save()

    return {
        user,
        accessToken,
        refreshToken
    }
}


// -------------------------------------------------
// Generates an Access Token.

const generateAccessToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN }
    )
}

// Generates a Refresh Token.

const generateRefreshToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN }
    )
}

// Hashes the Refresh Token before storing it in the database.
const hashRefreshToken = (refreshToken) => {
    return crypto
        .createHash("sha256")
        .update(refreshToken)
        .digest("hex")
}


// -------------------------------------------------
// Generates new Access and Refresh Tokens using a valid Refresh Token.

const refreshUserAccessToken = async (refreshToken) => {
    const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
    )

    const user = await User.findById(decoded.id)
        .select("+refreshTokenHash")

    if (!user || user.isBlocked || !user.refreshTokenHash) {
        throw new Error("Invalid refresh token")
    }

    const hashedToken = hashRefreshToken(refreshToken)

    if (hashedToken !== user.refreshTokenHash) {
        throw new Error("Invalid refresh token")
    }

    const newAccessToken = generateAccessToken(user._id)
    const newRefreshToken = generateRefreshToken(user._id)

    user.refreshTokenHash = hashRefreshToken(newRefreshToken)
    await user.save()

    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
    }
}


// -------------------------------------------------
// Revokes the user's Refresh Token during logout.

const logoutUser = async (refreshToken) => {
    if (!refreshToken) {
        return
    }

    try {
        const decoded = jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decoded.id)
            .select("+refreshTokenHash")

        if (!user) {
            return
        }

        const hashedToken = hashRefreshToken(refreshToken)

        if (hashedToken === user.refreshTokenHash) {
            user.refreshTokenHash = null
            await user.save()
        }
    } catch (error) {
        // Invalid or expired refresh tokens cannot be reused.
        return
    }
}


//-----------------------------------------------------------
//Change Password

const changePasswordService = async (userId, currentPassword, newPassword) => {
    const user = await User.findById(userId).select("+password")

    if (!user) throw new Error("User not found")

    if (user.authProvider === "google") {
        throw new Error("Google accounts cannot change password")
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password)

    if (!isMatch) {
        throw new Error("Current password is incorrect")
    }

    // Validates the new password requirements
    if (
        newPassword.length < 8 ||
        !/[A-Z]/.test(newPassword) ||
        !/[0-9]/.test(newPassword) ||
        !/[^A-Za-z0-9]/.test(newPassword)
    ) {
        throw new Error("Password must contain at least 8 characters, one uppercase letter, one number and one special symbol")
    }

    user.password = await bcrypt.hash(newPassword, 10)
    user.refreshTokenHash = null

    await user.save()

    return user
}


// -------------------------------------------------
//Login User.

const loginUser = async (email, password) => {
    const normalizedEmail = email.trim().toLowerCase()

    const user = await User.findOne({
        email: normalizedEmail
    }).select("+password")

    if (!user) {
        throw new Error("Invalid email or password")
    }

    if (user.authProvider === "google") {
        throw new Error(
            "This account was created using Google. Please login using Google."
        )
    }

    if (user.isBlocked) {
        throw new Error("Your account has been blocked. Please contact support.")
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password)

    if (!isPasswordMatch) {
        throw new Error("Invalid email or password")
    }

    const accessToken = generateAccessToken(user._id)
    const refreshToken = generateRefreshToken(user._id)

    user.refreshTokenHash = hashRefreshToken(refreshToken)
    await user.save()

    return {
        user,
        token: accessToken,
        refreshToken
    }
}


//--------------------------------------------------

module.exports = {
    registerUser,
    generateCurrentEmailOTP,
    verifyCurrentEmailOTP,
    generateNewEmailOTP,
    verifyNewEmailOTP,
    generateAndSendOTP,
    verifyOTP,
    resendOTP,
    changePasswordService,
    loginUser,
    generatePasswordResetOTP,
    verifyPasswordResetOTP,
    resetPassword,
    verifyGoogleToken,
    loginWithGoogle,
    refreshUserAccessToken,
    logoutUser
};