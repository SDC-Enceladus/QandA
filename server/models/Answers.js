const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    index: { unique: true },
  },
  question_id: {
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
  answerer_name: {
    type: String,
    required: true,
  },
  answerer_email: {
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

const Answers = mongoose.model("Answer", answerSchema);

module.exports = Answers;
