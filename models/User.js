const mongoose = require("mongoose");

// const UserSchema = new mongoose.Schema({
//   githubId: { type: String, required: true, unique: true },
//   username: { type: String },
//   avatar: { type: String },
// });
const UserSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  username: { type: String },
  email: {type:String},
  avatar: { type: String },
});

module.exports = mongoose.model("User", UserSchema);
