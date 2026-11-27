const {
    adminLoginService,
    refreshAdminAccessToken,
    adminLogoutService
} = require("../adminServices/adminUserService")

const adminLoginValidator = require("../adminValidators/adminLoginValidator")

//---------------------------------------------------------------------------------
// Admin login

const adminLoginController = async (req, res) => {
    try {
        const { email, password } = req.body
        const { errors, isValid } = adminLoginValidator(email, password)

        if (!isValid) {
            return res.status(400).json({
                success: false,
                errors
            })
        }

        const { admin, accessToken, refreshToken } =
            await adminLoginService(email, password)

        res.cookie("adminAccessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 15 * 60 * 1000
        })

        res.cookie("adminRefreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        return res.status(200).json({
            success: true,
            message: "Admin login successful",
            admin
        })

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: error.message
        })
    }
}


//---------------------------------------------------------------------------------
//Current Admin Details.

const adminGetProfileController = (req, res) => {
    return res.status(200).json({
        success: true,
        admin: {
            id: req.admin._id,
            name: req.admin.name,
            email: req.admin.email,
            role: req.admin.role
        }
    })
}


//-----------------------------------------------------------
// Refresh Admin Access Token

const adminRefreshTokenController = async (req, res) => {
    try {
        const refreshToken = req.cookies?.adminRefreshToken
        const { accessToken, refreshToken: newRefreshToken } =
            await refreshAdminAccessToken(refreshToken)

        res.cookie("adminAccessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 15 * 60 * 1000
        })

        res.cookie("adminRefreshToken", newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        return res.status(200).json({
            success: true,
            message: "Admin token refreshed successfully"
        })

    } catch (error) {
        res.clearCookie("adminAccessToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax"
        })

        res.clearCookie("adminRefreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax"
        })

        return res.status(401).json({
            success: false,
            message: error.message
        })
    }
}

//-----------------------------------------------------------
// Admin Logout

const adminLogoutController = async (req, res) => {
    try {
        const refreshToken = req.cookies?.adminRefreshToken
        await adminLogoutService(refreshToken)

        res.clearCookie("adminAccessToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax"
        })

        res.clearCookie("adminRefreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax"
        })

        return res.status(200).json({
            success: true,
            message: "Admin logout successful"
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Admin logout failed"
        })
    }
}

//---------------------------------------------------------------------------------

module.exports = {
    adminLoginController,
    adminGetProfileController,
    adminRefreshTokenController,
    adminLogoutController
}