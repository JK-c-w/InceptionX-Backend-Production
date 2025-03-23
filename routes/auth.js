const express = require("express");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const EUser = require("../models/EmailUser");
const router = express.Router();


// Google Login Route
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Google Callback Route 
router.get(
  "/google/callback",
  passport.authenticate("google", { 
    failureRedirect: "/login-failed",  
    session: true }),
    (req,res)=>{
       res.redirect("https://xceptionx.vercel.app");
    }
);

// Email Signup Route
router.post("/signup", async (req, res) => {
  // console.log(req.body);
  try {
    const { email, password } = req.body;

    if (!req.body || Object.keys(req.body).length === 0) {
      console.error(" Request body is empty!");
      return res.status(400).json({ message: "Invalid request. No data received." });
    }

    if (!email || !password) {
      console.error(" Missing required fields:", req.body);
      return res.status(400).json({ message: "All required fields must be filled correctly." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    let regex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
    if (!password.match(regex)) {
      return res.status(400).json({ message: "Password must contain a number, a special character, and an uppercase letter." });
    }

    let user = await EUser.findOne({ email });
    if (user) {
      return res.status(401).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

      const username =email.split('@')[0];
      //Create new User 
      user=new EUser({
        email,
        password:hashedPassword,
        username
      });
      const response= await user.save();
      console.log("Signup Successfully:", user);
      req.logIn(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Error logging in after signup" });
        }
        return res.status(200).json({ message: "Signup successful and logged in" });
      });
        
   } catch(err){
     console.error(err);
     res.status(500).json({message:"Server Error"});
   }
});

//Email Login Route
router.post("/login", (req, res, next) => {
  // console.log("Login Request:",req.body);
  passport.authenticate("local", async (err, user, info) => {
    if (err) return res.status(500).json({ message: "Server Error" });
    if (!user) return res.status(400).json({ message: info.message });

    req.logIn(user, (err) => {
      if (err) return res.status(500).json({ message: "Server Error" });
      return res.status(200).json({ message: "Login successful" });
    });
  })(req, res, next);
}
);

// Logout Route
router.get("/logout", (req, res) => {
  console.log("logout")
  req.session.destroy(err => {
    if (err) {
      console.log("Error destroying session:", err);
    } else {
      res.redirect('/login'); // or wherever
    }
  });
});

// Get Current User
router.get("/user",(req, res) => {
  console.log("User:",req.user);
  if (req.user) {
      res.json({
      id: req.user.id,
      username: req.user.username,
      avatar: req.user.avatar || "", // Fallback avatar
    });
  }else {
    console.log("Unauthorized access",req.user);
    res.status(401).json({ message: "Unauthorized access" });
  }
});



module.exports = router;
