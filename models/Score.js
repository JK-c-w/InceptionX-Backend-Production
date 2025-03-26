const mongoose = require("mongoose");
const ScoreSchema = new mongoose.Schema({
teamName: { type: String, required: true },
score: { type: Number, default: 0 },
uniqueID: { type: String, required: true, unique: true }
});

module.exports = mongoose.model("Score", ScoreSchema);