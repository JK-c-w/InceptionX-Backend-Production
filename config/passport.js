// 

const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const EUser = require("../models/EmailUser");

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || "supersecretkey",
};

// JWT Strategy
passport.use(
  new JwtStrategy(jwtOptions, async (jwt_payload, done) => {
    try {
      let user = await User.findById(jwt_payload.id);
      if (!user) {
        user = await EUser.findById(jwt_payload.id);
      }
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (err) {
      return done(err, false);
    }
  })
);

// Local Strategy for Email Login
passport.use(
  new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
    try {
      let user = await EUser.findOne({ email });
      if (!user) {
        return done(null, false, { message: "Invalid Credentials" });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return done(null, false, { message: "Invalid Credentials" });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

module.exports = passport;