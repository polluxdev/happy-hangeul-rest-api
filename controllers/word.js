const mongoose = require("mongoose");

const Word = require("../models/word");

exports.getWords = async (req, res, next) => {
  try {
    const words = await Word.find();
    const response = {
      status: "success",
      data: words,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
