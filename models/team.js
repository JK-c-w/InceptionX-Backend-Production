const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  college: { type: String, required: true },
  isLeader: { type: Boolean, required: true},
});

const teamSchema = new mongoose.Schema({
  teamName: { type: String, required: true, unique: true },
  teamSize: { type: Number, required: true },
  members: [memberSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Team", teamSchema);
