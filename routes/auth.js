const express = require("express");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const EUser = require("../models/EmailUser");
const {jwtAuthMiddleware,genrateToken}=require("../config/jwt")
const router = express.Router();


// GitHub Login Route
router.get("/github", passport.authenticate("github", { scope: ["user:email"] }),);

// GitHub Callback Route
router.get(
  "/github/callback",
  passport.authenticate("github", {session:false,
    failureRedirect:"https://inceptionx.vercel.app/login-failed",}),
  (req,res)=>{
    const payload={
      id:req.user.id,
      username:req.user.username
    }
    const token=genrateToken(payload);
     res.redirect(`https://inceptionx.vercel.app/login?token=${token}`);
      //res.redirect(`http://localhost:5173/login/?token=${token}`);
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

       const payload={
            id:response.id,
            username:response.username
       }
      console.log("payload :",payload);
      const token=genrateToken(payload);
      console.log("Token is :",token)
      // Redirect to login page
      res.status(200).json({message:"Account Created ",Token:token});
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
    
    const payload={
      id:user.id,
      username:user.username
    }
    const token = genrateToken(payload);
    return res.status(200).json({message: "Login succesful",Token:token});

    // req.logIn(user, (err) => {
    //   if (err) return res.status(500).json({ message: "Server Error" });
    //   return res.status(200).json({ message: "Login successful" });
    // });
  })(req, res, next);
}
);

// Logout Route
router.get("/logout", (req, res) => {
  console.log("logout")
  req.logout((err) => {
    if (err) return res.status(500).json({ message: "Logout failed" });
    req.session = null;
    //return res.redirect("http://localhost:5173");
  });
});

// Get Current User
router.get("/user",jwtAuthMiddleware,(req, res) => {
  console.log("Authenticated User:", req.user);
  if (req.isAuthenticated() && req.user) {
      res.json({
      id: req.user.id,
      username: req.user.username,
      avatar: req.user.avatar //|| "https://github.com/identicons/default.png", // Fallback avatar
    });
  } else {
    console.log(req.user);
    res.status(401).json({ message: "Not authenticated" });
  }
});

module.exports = router;
