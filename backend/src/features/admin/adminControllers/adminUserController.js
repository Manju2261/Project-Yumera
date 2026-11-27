const {
    adminBlockUserService,
    adminUnblockUserService,
    adminGetAllUsersService
} = require("../adminServices/adminUserService")

//--------------------------------------------------------
// Blocking a user.

const adminBlockUserController = async (req, res) => {
    try {
        const user = await adminBlockUserService(req.params.userId)

        return res.status(200).json({
            success: true,
            message: "User blocked successfully",
            user
        })
    } catch (error) {
        return res.status(404).json({
            success: false,
            message: error.message
        })
    }
}

//--------------------------------------------------------
// Unblocking a user.

const adminUnblockUserController = async (req, res) => {
    try {
        const user = await adminUnblockUserService(req.params.userId)

        return res.status(200).json({
            success: true,
            message: "User unblocked successfully",
            user
        })
    } catch (error) {
        return res.status(404).json({
            success: false,
            message: error.message
        })
    }
}

//--------------------------------------------------------
// Fetching users with pagination and search.

const adminGetAllUsersController = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1)
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10))
        const search = (req.query.search || "").trim()

        const result = await adminGetAllUsersService(page, limit, search)

        return res.status(200).json({
            success: true,
            ...result
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch users"
        })
    }
}

//--------------------------------------------------------

module.exports = {
    adminBlockUserController,
    adminUnblockUserController,
    adminGetAllUsersController
}