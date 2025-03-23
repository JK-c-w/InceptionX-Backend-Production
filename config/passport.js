const passport=require("passport");

const User = require("../models/User");
const EUser =require('../models/EmailUser');
const LocalStrategy=require("passport-local").Strategy;
const bcrypt =require("bcryptjs");
const jwt=require("jsonwebtoken") ;
const GoogleStrategy = require("passport-google-oauth20").Strategy;

// Goggle Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID, // Add this to your .env file
      clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Add this to your .env file
      callbackURL: "https://inceptionx-production.onrender.com/auth/google/callback", // Replace with your callback URL
      passReqTocallback:true
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Find or create user in your database
        console.log(profile.id);
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
          user = new User({
            googleId: profile.id,
            username: profile.displayName,
            email: profile.emails[0].value,
            avatar: profile.photos?.[0]?.value || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
          });
          await user.save();
          console.log("New user registered:", user);
        }else {
          console.log(" Existing user found:", user);
        }
        return done(null, user);
      } catch (err) {
        console.log(err)
        return done(err, null);
      }
    }
  )
);

// Local Strategy for Email Login
passport.use(
  new LocalStrategy({ usernameField:"email"},async (email, password, done) => {
    try {
      console.log(email ,password) 
      //Check if user exists
      let user = await EUser.findOne({email});
      if (!user) {
        console.log("Invalid email")
        return done(null, false, { message: "Invalid Credentials" });
      }
      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        console.log("Invalid Pass")
        return done(null, false, { message: "Invalid Credentials" });
      }
      
      console.log("Login Successfully:", user);
      return done(null, user);
    } 
    catch (err) {
      console.error(err);
      return done(err);
    }
}));

passport.serializeUser((user, done) => {
   console.log("serializing user",user.id);
  done(null,user.id);
});

passport.deserializeUser(async (id, done) => {
  console.log("deserializing user",id)
  try {
    let user = await User.findById(id);
    if(!user) {
       user=await EUser.findById(id);
    }
    console.log(user)
    if (user) {
      done(null, {
        id: user.id,
        username: user.username,
        avatar: user.avatar,
      });
    } else {
      console.warn(" User not found during deserialization");
      done(null, null);
    }
  } catch (err) {
    console.error(" Error deserializing user:", err);
    done(err, null);
  }
});
