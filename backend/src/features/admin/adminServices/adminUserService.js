// Authenticates Admin with existing User collection.

const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const User = require("../../authentication/models/User")

const adminLoginService = async (email, password) => {
    const normalizedEmail = email.trim().toLowerCase()

    const admin = await User.findOne({
        email: normalizedEmail,
        role: "admin"
    }).select("+password")

    if (!admin) 
    {
        throw new Error("Invalid admin credentials")
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password)

    if (!isPasswordValid) 
    {
        throw new Error("Invalid admin credentials")
    }

    const token = jwt.sign(
        { id: admin._id },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    )

    return {
        admin: {
            id: admin._id,
            name: admin.name,
            email: admin.email,
            role: admin.role
        },
        token
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
    adminBlockUserService,
    adminUnblockUserService,
    adminGetAllUsersService
}

