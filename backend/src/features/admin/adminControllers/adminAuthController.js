
const { adminLoginService } = require("../adminServices/adminUserService")
const adminLoginValidator = require("../adminValidators/adminLoginValidator")

//---------------------------------------------------------------------------------
// Admin login 
const adminLoginController = async (req, res) => {
    try 
    {
        const { email, password } = req.body
        const { errors, isValid } = adminLoginValidator(email, password)

        if (!isValid) 
        {
            return res.status(400).json({
                success: false,
                errors
            })
        }

        const { admin, token } = await adminLoginService(email, password)

        res.cookie("adminToken", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000
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
//Currently Authenticated Admin Details.

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


//---------------------------------------------------------------------------------

module.exports = { 
    adminLoginController,
    adminGetProfileController
}