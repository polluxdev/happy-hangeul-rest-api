const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const wordSchema = new Schema({
  basic: {
    type: String,
    required: true,
  },
  type: {
    type: Array,
    required: true,
  },
  conjugated: {
    type: String,
    required: true,
  },
  example_phrase: {
    type: String,
    required: true,
  },
  example_sentence: {
    type: String,
    required: true,
  },
  mark: {
    type: String,
    required: true,
    default: "default",
  },
  rating: {
    type: Number,
    required: true,
    default: 0,
  },
});

module.exports = mongoose.model("Word", wordSchema);
