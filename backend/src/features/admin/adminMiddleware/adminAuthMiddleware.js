// Admin authentication 

const jwt = require("jsonwebtoken")
const User = require("../../authentication/models/User")

const adminAuthMiddleware = async (req, res, next) => {
    const adminToken = req.cookies?.adminToken

    if (!adminToken) 
    {
        return res.status(401).json({
            success: false,
            message: "Admin authentication required. Please login."
        })
    }

    try 
    {
        const decoded = jwt.verify(adminToken, process.env.JWT_SECRET)

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