const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    index: { unique: true },
  },
  product_id: {
    type: Number,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  asker_name: {
    type: String,
    required: true,
  },
  asker_email: {
    type: String,
  },
  reported: {
    type: Boolean,
    default: false,
  },
  helpfulness: {
    type: Number,
    default: 0,
  },
});

const Question = mongoose.model("Question", questionSchema);

module.exports = Question;
