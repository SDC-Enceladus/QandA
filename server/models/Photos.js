const db = require("./../database/index");
const mongoose = require("mongoose");

const photosSchema = new db.Schema({
  id: {
    type: Number,
    required: true,
    index: { unique: true },
  },
  answer_id: {
    type: Number,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
});

const Photos = mongoose.model("Photo", photosSchema);

module.exports = Photos;
