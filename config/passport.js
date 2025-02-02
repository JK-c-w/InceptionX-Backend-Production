const passport = require("passport");
const GitHubStrategy = require("passport-github2").Strategy;
const User = require("../models/user");

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

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
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
