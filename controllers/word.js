const mongoose = require("mongoose");

const Word = require("../models/word");

const APIFeatures = require("../utils/apiFeatures");

exports.getWords = async (req, res, next) => {
  try {
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
  } catch (error) {
    next(error);
  }
};

exports.getWord = async (req, res, next) => {
  const wordId = req.params.wordId;
  try {
    const word = await Word.findById(wordId);
    const response = {
      status: "success",
      data: word,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

exports.postWord = async (req, res, next) => {
  const wordBody = req.body;
  try {
    const word = await Word.create(wordBody);
    const response = {
      status: "success",
      data: word,
    };

    res.status(201).json(response);
  } catch (error) {
    res.status(500).json({
      status: "fail",
      error,
    })
    // next(error);
  }
};

exports.patchWord = async (req, res, next) => {
  const wordId = req.params.wordId;
  const wordBody = req.body;
  try {
    const word = await Word.findByIdAndUpdate(wordId, wordBody, {
      new: true,
      runValidators: true,
    });
    const response = {
      status: "success",
      data: word,
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

exports.deleteWord = async (req, res, next) => {
  const wordId = req.params.wordId;
  try {
    await Word.findByIdAndDelete(wordId);
    const response = {
      status: "success",
      data: null,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

exports.getWordStats = async (req, res, next) => {
  try {
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
  } catch (error) {
    next(error);
  }
};
