// Verifies the JWT cookie and handles authentication and database errors separately.
const jwt = require("jsonwebtoken")
const User = require("../models/User")

const authMiddleware = async (req, res, next) => {
    const accessToken = req.cookies?.accessToken

    if (!accessToken) 
    {
        return res.status(401).json({
            success: false,
            message: "Authentication required. Please login."
        })
    }

    let decoded

    try 
    {
        decoded = jwt.verify(
            accessToken,
            process.env.ACCESS_TOKEN_SECRET
        )
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token. Please login again."
        })
    }

    if (!decoded.id) 
    {
        return res.status(401).json({
            success: false,
            message: "Invalid authentication token."
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

        if (user.isBlocked) 
        {
            return res.status(403).json({
                success: false,
                message: "Your account has been blocked. Please contact support."
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