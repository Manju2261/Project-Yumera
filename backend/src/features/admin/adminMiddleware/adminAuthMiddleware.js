const jwt = require("jsonwebtoken")
const User = require("../../authentication/models/User")

const adminAuthMiddleware = async (req, res, next) => {
    const adminAccessToken = req.cookies?.adminAccessToken
    if (!adminAccessToken) {
        return res.status(401).json({
            success: false,
            message: "Admin authentication required. Please login."
        })
    }
    try {
        const decoded = jwt.verify(
            adminAccessToken,
            process.env.ADMIN_ACCESS_TOKEN_SECRET
        )

        if (decoded.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admin privileges required."
            })
        }

        const admin = await User.findOne({
            _id: decoded.id,
            role: "admin"
        }).select("-password")

        if (!admin) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admin privileges required."
            })
        }

        if (admin.isBlocked) {
            return res.status(403).json({
                success: false,
                message: "Admin account is blocked."
            })
        }

        req.admin = admin
        next()

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired admin session."
        })
    }
}

module.exports = adminAuthMiddleware