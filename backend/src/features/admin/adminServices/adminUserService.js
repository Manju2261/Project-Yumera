const crypto = require("crypto")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const User = require("../../authentication/models/User")

//-----------------------------------------------------------
// Generate Admin Access Token

const generateAdminAccessToken = (adminId) => {
    return jwt.sign(
        { id: adminId, role: "admin" },
        process.env.ADMIN_ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ADMIN_ACCESS_TOKEN_EXPIRES_IN
        }
    )
}


//--------------------------------------------------------------
// Generate Admin Refresh Token

const generateAdminRefreshToken = (adminId) => {
    return jwt.sign(
        { id: adminId, role: "admin" },
        process.env.ADMIN_REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.ADMIN_REFRESH_TOKEN_EXPIRES_IN
        }
    )
}


//---------------------------------------------------------
//Admin Login

const adminLoginService = async (email, password) => {
    const normalizedEmail = email.trim().toLowerCase()

    const admin = await User.findOne({
        email: normalizedEmail,
        role: "admin"
    }).select("+password")

    if (!admin) {
        throw new Error("Invalid admin credentials")
    }
    if (admin.isBlocked) {
        throw new Error("Admin account is blocked")
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password)

    if (!isPasswordValid) {
        throw new Error("Invalid admin credentials")
    }

    const accessToken = generateAdminAccessToken(admin._id)
    const refreshToken = generateAdminRefreshToken(admin._id)

    admin.adminRefreshTokenHash = crypto
        .createHash("sha256")
        .update(refreshToken)
        .digest("hex")

    await admin.save()

    return {
        admin: {
            id: admin._id,
            name: admin.name,
            email: admin.email,
            role: admin.role
        },
        accessToken,
        refreshToken
    }
}


//-----------------------------------------------------------
// Admin Logout

const adminLogoutService = async (refreshToken) => {
    if (!refreshToken) {
        return
    }

    const hashedRefreshToken = crypto
        .createHash("sha256")
        .update(refreshToken)
        .digest("hex")

    await User.findOneAndUpdate(
        {
            role: "admin",
            adminRefreshTokenHash: hashedRefreshToken
        },
        {
            $set: {
                adminRefreshTokenHash: null
            }
        }
    )
}


//-----------------------------------------------------------
// Refresh Admin Tokens

const refreshAdminAccessToken = async (refreshToken) => {
    if (!refreshToken) {
        throw new Error("Admin refresh token is required")
    }

    let decoded

    try {
        decoded = jwt.verify(
            refreshToken,
            process.env.ADMIN_REFRESH_TOKEN_SECRET
        )
    } catch (error) {
        throw new Error("Invalid or expired admin refresh token")
    }

    if (decoded.role !== "admin") {
        throw new Error("Invalid admin refresh token")
    }

    const admin = await User.findOne({
        _id: decoded.id,
        role: "admin"
    }).select("+adminRefreshTokenHash")

    if (!admin || admin.isBlocked) {
        throw new Error("Admin authentication failed")
    }

    const hashedRefreshToken = crypto
        .createHash("sha256")
        .update(refreshToken)
        .digest("hex")

    if (hashedRefreshToken !== admin.adminRefreshTokenHash) {
        throw new Error("Invalid admin refresh token")
    }

    const accessToken = generateAdminAccessToken(admin._id)
    const newRefreshToken = generateAdminRefreshToken(admin._id)

    admin.adminRefreshTokenHash = crypto
        .createHash("sha256")
        .update(newRefreshToken)
        .digest("hex")

    await admin.save()

    return {
        accessToken,
        refreshToken: newRefreshToken
    }
}


//----------------------------------------------------------
// Block a user account.

const adminBlockUserService = async (userId) => {
    const user = await User.findOneAndUpdate(
        {
            _id: userId,
            role: "user"
        },
        {
            $set: { isBlocked: true }
        },
        {
            returnDocument: "after",
            runValidators: true
        }
    ).select("-password")

    if (!user) {
        throw new Error("User not found")
    }

    return user
}


//----------------------------------------------------------
// Unblocks a user account.

const adminUnblockUserService = async (userId) => {
    const user = await User.findOneAndUpdate(
        {
            _id: userId,
            role: "user"
        },
        {
            $set: { isBlocked: false }
        },
        {
            returnDocument: "after",
            runValidators: true
        }
    ).select("-password")

    if (!user) {
        throw new Error("User not found")
    }

    return user
}


//----------------------------------------------------------
// Get All Users - Search with Pagination.

const adminGetAllUsersService = async (page, limit, search) => {
    const skip = (page - 1) * limit

    const searchFilter = search
        ? {
            $or: [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } }
            ]
        }
        : {}

    const filter = {
        role: "user",
        ...searchFilter
    }

    const [users, totalUsers] = await Promise.all([
        User.find(filter)
            .select("-password")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),

        User.countDocuments(filter)
    ])

    return {
        users,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalUsers / limit),
            totalUsers,
            limit
        }
    }
}

//----------------------------------------------------------
module.exports = {
    adminLoginService,
    refreshAdminAccessToken,
    adminLogoutService,
    adminBlockUserService,
    adminUnblockUserService,
    adminGetAllUsersService
}

