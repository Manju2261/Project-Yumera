// Admin authentication API routes.

const express = require("express")
const { 
    adminLoginController,
    adminGetProfileController,
    adminRefreshTokenController,
    adminLogoutController
} = require("../adminControllers/adminAuthController")

const adminAuthMiddleware = require("../adminMiddleware/adminAuthMiddleware")

const adminAuthRoutes = express.Router()

adminAuthRoutes
    .post("/login", adminLoginController)
    .get("/me", adminAuthMiddleware, adminGetProfileController)
    .post("/refresh", adminRefreshTokenController)
    .post("/logout", adminLogoutController)

module.exports = adminAuthRoutes