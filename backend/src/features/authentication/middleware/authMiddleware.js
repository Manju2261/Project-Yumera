// Verifies the JWT cookie and handles authentication and database errors separately.
const jwt = require("jsonwebtoken")
const User = require("../models/User")

const authMiddleware = async (req, res, next) => {
    const token = req.cookies?.token

    if (!token) 
    {
        return res.status(401).json({
            success: false,
            message: "Authentication required. Please login."
        })
    }

    let decoded

    try 
    {
        decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token. Please login again."
        })
    }

    try 
    {
        const user = await User.findById(decoded.id).select("-password")

        if (!user) 
        {
            return res.status(401).json({
                success: false,
                message: "User not found. Please login again."
            })
        }

        req.user = user
        next()
    } catch (error) 
    {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

module.exports = authMiddleware