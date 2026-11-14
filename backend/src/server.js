
const express = require("express");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./features/authentication/routes/authRoutes");

const app = express();

app.use(express.json());
app.use("/api/auth", authRoutes);

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
