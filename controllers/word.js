const Word = require("../models/word");

const APIFeatures = require("../utils/apiFeatures");
const AppError = require("../utils/appError");

const catchAsync = require("../utils/catchAsync");

exports.checkWord = catchAsync(async (req, res, next) => {
  const wordId = req.params.wordId;
  const word = await Word.findById(wordId);
  if (!word) {
    const error = new AppError("Word not found!", 404);
    return next(error);
  }
  next();
});

exports.getWords = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Word.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const words = await features.query;

  const response = {
    status: "success",
    count: words.length,
    data: words,
  };

  res.status(200).json(response);
});

exports.getWord = catchAsync(async (req, res, next) => {
  const wordId = req.params.wordId;
  const word = await Word.findById(wordId);
  const response = {
    status: "success",
    data: word,
  };

  res.status(200).json(response);
});

exports.postWord = catchAsync(async (req, res, next) => {
  const wordBody = req.body;
  const word = await Word.create(wordBody);
  const response = {
    status: "success",
    data: word,
  };

  res.status(201).json(response);
});

exports.patchWord = catchAsync(async (req, res, next) => {
  const wordId = req.params.wordId;
  const wordBody = req.body;
  const word = await Word.findByIdAndUpdate(wordId, wordBody, {
    new: true,
    runValidators: true,
  });
  const response = {
    status: "success",
    data: word,
  };

  res.status(201).json(response);
});

exports.deleteWord = catchAsync(async (req, res, next) => {
  const wordId = req.params.wordId;
  await Word.findByIdAndDelete(wordId);
  const response = {
    status: "success",
    data: null,
  };

  res.status(200).json(response);
});

exports.getWordStats = catchAsync(async (req, res, next) => {
  const stats = await Word.aggregate([
    {
      $match: { rating: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: "$type",
        numWords: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);
  const response = {
    status: "success",
    data: stats,
  };

  res.status(200).json(response);
});
