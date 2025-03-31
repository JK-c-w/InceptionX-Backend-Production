require("dotenv").config();
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const cors = require("cors");
const connectDB = require("./config/db");
const MongoStore =require('connect-mongo');
const cookieParser=require('cookie-parser');
require("./config/passport");

const authRoutes = require("./routes/auth");
const teamRoutes = require("./routes/teamRoutes");

const app = express();
app.set('trust proxy', 1);
// Middleware
app.use(
  cors({
     origin: "https://xception.vercel.app", // Production link
      // origin: "http://localhost:5173", // Development link
    credentials: true, // Allow cookies in requests
  })
);

app.use(express.json());

//  Session Management
app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecretkey",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: 'sessions'
    }),
    cookie: {
       secure:true, // Enable in production with HTTPS
       httpOnly:true,
       sameSite: "none",
       maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

app.use(cookieParser())
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());


// Routes
app.use("/auth", authRoutes);
app.use("/team", teamRoutes);

// Start Server After Connecting to Database
const PORT = process.env.PORT || 5000;
connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("Failed to connect to DB:", err);
    process.exit(1);
  });
  app.get("/", (req, res) => {
    res.send("Backend is running 🚀");
  });
  
 
  
