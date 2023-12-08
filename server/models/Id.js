const db = require("./../database/index");
const mongoose = require("mongoose");

const idSchema = new db.Schema({
  id: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
});

const Ids = mongoose.model("Id", idSchema);

module.exports = Ids;
