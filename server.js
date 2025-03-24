const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");

// Load env variables
dotenv.config({ path: "./config/config.env" });

// Connect to database
connectDB();

// Route files
const campgrouds = require("./routes/campgrounds");
const bookings = require("./routes/bookings");
const auth = require("./routes/auth");

const app = express();

// Body parser
app.use(express.json());
app.use(cookieParser());
app.use(cors());

// Routes
app.use("/api/v1/campgrounds", campgrouds);
app.use("/api/v1/auth", auth);
app.use("/api/v1/bookings", bookings);

// Export app for Vercel
module.exports = app;
