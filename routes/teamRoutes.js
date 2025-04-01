const express = require("express");
const Team = require("../models/team");
const Score =require ("../models/Score")
const {Readable} =require("stream");
const gfs=require("../config/gfs")
const { ensureAuth } = require("../middleware/authMiddleware");

const router = express.Router();

// Register a team
router.post("/register",ensureAuth ,async (req, res) => {
  try {
    console.log("Incoming Registration Data:", req.body); // Debug incoming request

    const { teamName, members } = req.body;

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

     // Process each member's `id_card`
     const processedMembers = await Promise.all(
      members.map(async (member) => {
        if (!member.id_card) {
          throw new Error(`Missing id_card for member: ${member.name}`);
        }
    
        const writeStream = gfs.createWriteStream({
          filename: `${teamName}-icCard.jpg`, // File name
          content_type: "image/jpeg", // MIME type
        });
        // Add any additional processing logic here if needed
        // return member; // Return the processed member
        console.log("member:",member)
      })
    );
    

    // ✅ Save team to database
    const newTeam = new Team({
      teamName,
      teamSize: members.length , // Ensure it's a number
      // termsAccepted,
      members,
      createdBy: req.user.id,
    });

    await newTeam.save();
    console.log("Team Registered Successfully:", newTeam);

     // ✅ Add the team to the Score database
     const newScore = new Score({
      teamName: newTeam.teamName,
      uniqueID: newTeam._id.toString(), // Use the team's unique ID
    });

    await newScore.save();
    console.log("Team Added to Score Database:", newScore);

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
