const express = require("express");
const passport = require("passport");

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
