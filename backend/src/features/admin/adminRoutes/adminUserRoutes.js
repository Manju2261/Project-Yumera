// Admin user management routes.
const express = require("express")

const adminAuthMiddleware = require("../adminMiddleware/adminAuthMiddleware")

const {
    adminBlockUserController,
    adminUnblockUserController,
    adminGetAllUsersController
} = require("../adminControllers/adminUserController")

const adminUserRoutes = express.Router()

adminUserRoutes
    .get("/", adminAuthMiddleware, adminGetAllUsersController)
    .patch("/:userId/block", adminAuthMiddleware, adminBlockUserController)
    .patch("/:userId/unblock", adminAuthMiddleware, adminUnblockUserController)

module.exports = adminUserRoutes