const express = require("express");
const passport = require("passport");
const bcrypt = require("bcrypt");
const EUser=require("../models/EmailUser");
const router = express.Router();

// GitHub Login Route
router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));

// GitHub Callback Route
router.get(
  "/github/callback",
  passport.authenticate("github", {
    failureRedirect: "http://localhost:5173/login-failed",
    successRedirect: "http://localhost:5173",
  })
);

//Email Signup Route
router.post("/signup", async (req, res) => {
  console.log(req.body);
   try{
       // getting data    
       const {email ,password}=req.body;

        //  Check if `req.body` is missing
        if (!req.body || Object.keys(req.body).length === 0) {
        console.error(" Request body is empty!");
       return res.status(400).json({ message: "Invalid request. No data received." });
      }

      // Check if required fields are filled
      if(!email || !password){
        console.error(" Missing required fields:", req.body);
        return res.status(400).json({ message: "All required fields must be filled correctly." });
      }

      // check the length of password
      if(password.length<6){
        return res.status(400).json({message:"Password must be atleast 6 characters"});
      }

      // check if the password containes a number , a special character and a uppercase letter
      let regex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
      if(!password.match(regex)){
          return res.status(400).json({message:"Password must contain a number , a special character and a uppercase letter"});
        }

      // Check if user exists
      let user = await EUser.findOne({email});
      if(user){
        return res.status(401).json({message:"User already exists"});
      }

      //Hash Password
      const salt =await bcrypt.genSalt(10);
      const hashedPassword=await bcrypt.hash(password,salt);

      //Create new User 
      user=new EUser({
        email,
        password:hashedPassword,
      });
      await user.save();
      console.log("Signup Successfully:", user);
      // Redirect to login page
      res.status(200).json({message:"Account Created "});;
   } catch(err){
     console.error(err);
     res.status(500).json({message:"Server Error"});
   }
});

//Email Login Route
router.post("/login",async(req,res)=>{
  const {email ,password}=req.body;
  try{
    //Check if user exists
    let user=await EUser.findOne({email});
    if(!user){
      return res.status(401).json({message:"Invalid Credentials"});
    }
    // Check password
    const isMatch =await bcrypt.compare(password , user.password);
    if(!isMatch){
      return res.status(401).json({message:"Invalid Credentials"});
    }
    //Authenticate User
    req.login(user,(err)=>{
      if(err){
        return res.status(401).json({message:"Invalid Credentials"});
      }
      res.status(200).json({message:"Login succesfully"});
    });
  }
   catch(err){
    console.error(err);
    res.status(500).json({message:"Server Error"});
  }
});

// Logout Route
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ message: "Logout failed" });
    req.session = null;
    res.redirect("http://localhost:5173");
  });
});

// Get Current User
router.get("/user", (req, res) => {

  console.log("Authenticated User:", req.user); // Debugging

  if (req.isAuthenticated() && req.user) {
    res.json({
      id: req.user.id,
      username: req.user.username,
      avatar: req.user.avatar || "https://github.com/identicons/default.png", // Fallback avatar
    });
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
});

module.exports = router;
