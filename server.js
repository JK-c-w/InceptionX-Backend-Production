require("dotenv").config();
const express = require("express");
const passport = require("passport");
const session = require("express-session");
const cors = require("cors");
const connectDB = require("./config/db");
require("./config/passport");

const authRoutes = require("./routes/auth");
const teamRoutes = require("./routes/teamRoutes");

const app = express();

// Determine if running in production
const isProduction = process.env.NODE_ENV === "production";

// Configure allowed CORS origins dynamically
const allowedOrigins = isProduction
  ? [process.env.PROD_CLIENT_URL]
  : [process.env.CLIENT_URL, "http://localhost:5173"];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true, // Allow cookies in requests
  })
);

app.use(express.json());

// Session Management
app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecretkey",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProduction, // Secure cookies in production with HTTPS
      httpOnly: true,
      sameSite: isProduction ? "none" : "lax", // Allow cross-site requests in production
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/auth", authRoutes);
app.use("/team", teamRoutes);

// Health Check Route
app.get("/", (req, res) => {
  res.status(200).send("Backend is running!");
});

// Start Server After Connecting to Database
const PORT = process.env.PORT || 5000;
connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error(" Failed to connect to DB:", err);
    process.exit(1);
  });
