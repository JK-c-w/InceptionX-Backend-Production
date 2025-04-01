const mongoose = require("mongoose");
const Grid = require("gridfs-stream");

let gfs;

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  
  mongoose.connection.once("open", () => {
    gfs = Grid(mongoose.connection.db, mongoose.mongo);
    gfs.collection("uploads"); // Collection name for storing files
  });
  
  module.exports = gfs;