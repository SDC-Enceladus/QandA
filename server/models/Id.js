const mongoose = require("mongoose");

const idSchema = new mongoose.Schema({
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
