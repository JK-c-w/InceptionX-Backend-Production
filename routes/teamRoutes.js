const express = require("express");
const Team = require("../models/team");
const { ensureAuth } = require("../middleware/authMiddleware");

const router = express.Router();

// Register a team
router.post("/register",ensureAuth ,async (req, res) => {
  try {
    console.log("Incoming Registration Data:", req.body); // Debug incoming request

    const { teamName, teamSize, members } = req.body;

    // 🛠 Check if `req.body` is missing
    if (!req.body || Object.keys(req.body).length === 0) {
      console.error(" Request body is empty!");
      return res.status(400).json({ message: "Invalid request. No data received." });
    }

    // 🛠 Validate required fields
    if (!teamName  || !Array.isArray(members)) {
      console.error(" Missing required fields:", req.body);
      return res.status(400).json({ message: "All required fields must be filled correctly." });
    }

    // 🛠 Ensure `members.length` matches `teamSize`
    if (members.length !== Number(teamSize)) {
      console.error(` Mismatch: Expected teamSize ${teamSize}, but got ${members.length}`);
      return res.status(400).json({ message: "Number of members must match team size." });
    }
    // 🛠 Ensure user authentication is working
    if (!req.user || !req.user.id) {
      console.log("Authenticated User:", req.user); // Debugging
      console.error("Authentication error: User not found.");
      return res.status(401).json({ message: "Unauthorized. Please log in." });
    }

    // 🛠 Check if team name already exists
    const existingTeam = await Team.findOne({ teamName });
    if (existingTeam) {
      console.error(" Team name already exists:", teamName);
      return res.status(400).json({ message: "Team name already taken." });
    }

    // ✅ Save team to database
    const newTeam = new Team({
      teamName,
      teamSize: Number(teamSize), // Ensure it's a number
      // termsAccepted,
      members,
      createdBy: req.user.id,
    });

    await newTeam.save();
    console.log("Team Registered Successfully:", newTeam);

    res.status(201).json({ message: "Team registered successfully!", teamId: newTeam._id });
  } catch (error) {
    console.error("Error registering team:", error);
    
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: "Invalid data format.", details: error.errors });
    }

    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

module.exports = router;
