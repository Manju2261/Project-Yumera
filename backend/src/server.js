
const express = require("express");
require("dotenv").config();
const cookieParser = require("cookie-parser")
const cors = require("cors")

const { GetObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("./config/s3");

const connectDB = require("./config/db");
const authRoutes = require("./features/authentication/routes/authRoutes");
const adminAuthRoutes = require("./features/admin/adminRoutes/adminAuthRoutes")
const adminUserRoutes = require("./features/admin/adminRoutes/adminUserRoutes")
const userRoutes = require("./features/user/userRoutes/userRoutes");

const app = express();
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))
app.use(express.json());
app.use(cookieParser())
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminAuthRoutes)
app.use("/api/admin/users", adminUserRoutes)

app.use("/api/user", userRoutes);

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "YUMERA Backend is Running",
    });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});
