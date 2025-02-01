const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  socialLink: { type: String, required: false },
  role: { type: String, required: false },
});

const teamSchema = new mongoose.Schema({
  teamName: { type: String, required: true, unique: true },
  teamDescription: { type: String },
  teamSize: { type: Number, required: true },
  theme: { type: String, required: true },
  participantType: { type: String, required: true },
  source: { type: String, required: true },
  termsAccepted: { type: Boolean, required: true },
  members: [memberSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Team", teamSchema);
