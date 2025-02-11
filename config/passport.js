const passport = require("passport");
const GitHubStrategy = require("passport-github2").Strategy;
const User = require("../models/User");
const EUser =require('../models/EmailUser');
const LocalStrategy=require("passport-local").Strategy;
const bcrypt =require("bcryptjs")

//Git Strategy 
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/auth/github/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("GitHub Profile:", profile); // Debugging

        let user = await User.findOne({ githubId: profile.id });

        if (!user) {
          user = new User({
            githubId: profile.id,
            username: profile.username || profile.displayName || "Unknown",
            avatar: profile.photos?.[0]?.value || "https://github.com/identicons/default.png", // Default avatar
          });
          await user.save();
          console.log("✅ User saved:", user);
        } else {
          console.log("ℹ️ User already exists:", user);
        }

        return done(null, user);
      } catch (err) {
        console.error("❌ Error saving user:", err);
        return done(err, null);
      }
    }
  )
);
// Local Strategy for Email Login
passport.use(
  new LocalStrategy({ usernameField:"email"},async (email, password, done) => {
    try {
      console.log(email)
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
  console.log("serializing user")
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  console.log("deserializing user",id)
  try {
    let user = await User.findById(id);
    if(!user) {
       user=await EUser.findById(id);
    }
    if (user) {
      done(null, {
        id: user.id,
        username: user.username,
        avatar: user.avatar, // Ensure avatar is included
      });
    } else {
      done(null, null);
    }
  } catch (err) {
    done(err, null);
  }
});
