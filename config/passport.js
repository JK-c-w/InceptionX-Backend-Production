const passport = require("passport");
const GitHubStrategy = require("passport-github2").Strategy;
const User = require("../models/User");

const isProduction = process.env.NODE_ENV === "production";
const githubCallbackURL = isProduction
  ? process.env.GITHUB_CALLBACK_URL
  : "http://localhost:5000/auth/github/callback";

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: githubCallbackURL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("🔹 GitHub Profile:", profile);

        let user = await User.findOne({ githubId: profile.id });

        if (!user) {
          user = new User({
            githubId: profile.id,
            username: profile.username || profile.displayName || "Unknown",
            avatar: profile.photos?.[0]?.value || "https://github.com/identicons/default.png",
          });
          await user.save();
          console.log("New user registered:", user);
        } else {
          console.log(" Existing user found:", user);
        }

        return done(null, user);
      } catch (err) {
        console.error(" Error in GitHub Strategy:", err);
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
