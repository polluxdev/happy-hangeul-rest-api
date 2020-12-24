const mongoose = require("mongoose");
const slugify = require("slugify");
const validator = require('validator');

const Schema = mongoose.Schema;

const wordSchema = new Schema(
  {
    basic: {
      type: String,
      required: [true, "A word must have basic form"],
    },
    type: {
      type: Array,
      required: [true, "A word must have type"],
    },
    conjugated: {
      type: String,
      required: [true, "A word must have conjugated form"],
    },
    example_phrase: {
      type: String,
      required: [true, "A word must have example phrase"],
    },
    example_sentence: {
      type: String,
      required: [true, "A word must have example sentence"],
    },
    mark: {
      type: String,
      required: [true, "A word must have mark"],
      default: "default",
      enum: {
        values: ["process", "finish", "default"],
        message: "Mark is either: process, finish, default",
      },
    },
    rating: {
      type: Number,
      required: [true, "A word must have rating"],
      default: 0,
      min: [1, "A word rating must have more or equal than 1"],
      max: [5, "A word rating must have not more than 5"],
    },
    slug: String,
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  { toJSON: { virtual: true }, toObject: { virtual: true } }
);

// wordSchema.virtual("ratingPerWeek").get(function () {
//   return this.rating / 7;
// });

wordSchema.pre("save", function (next) {
  this.slug = slugify(this.basic, { lower: true });
  next();
});

wordSchema.pre(/^find/, function (next) {
  this.find({ rating: { $gt: 4 } });
  next();
});

wordSchema.pre("aggregate", function (next) {
  this.pipeline().unshift({ $match: { rating: { $gt: 4 } } });
  next();
});

module.exports = mongoose.model("Word", wordSchema);
