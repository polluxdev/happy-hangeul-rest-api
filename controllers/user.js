const User = require("../models/user");
const catchAsync = require("../utils/catchAsync");

exports.getUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  const response = {
    status: "success",
    count: users.length,
    data: users,
  };

  res.status(200).json(response);
});