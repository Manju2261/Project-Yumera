// Admin authentication API routes.

const express = require("express")
const { 
    adminLoginController,
    adminGetProfileController
} = require("../adminControllers/adminAuthController")

const adminAuthMiddleware = require("../adminMiddleware/adminAuthMiddleware")

const adminAuthRoutes = express.Router()

adminAuthRoutes
    .post("/login", adminLoginController)
    .get("/me", adminAuthMiddleware, adminGetProfileController)


module.exports = adminAuthRoutes