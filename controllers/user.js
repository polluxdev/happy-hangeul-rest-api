const User = require("../models/user");
const catchAsync = require("../utils/catchAsync");

const AppError = require("../utils/appError");

const filterObj = (body, ...elements) => {
  const newObj = {};

  Object.keys(body).forEach((el) => {
    if (elements.includes(el)) newObj[el] = body[el];
  });

  return newObj;
};

exports.getUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  const response = {
    status: "success",
    count: users.length,
    data: users,
  };

  res.status(200).json(response);
});

exports.getUser = catchAsync(async (req, res, next) => {});
exports.postUser = catchAsync(async (req, res, next) => {});
exports.patchUser = catchAsync(async (req, res, next) => {});
exports.deleteUser = catchAsync(async (req, res, next) => {});

exports.updateProfile = catchAsync(async (req, res, next) => {
  if (!req.user) {
    return next(new AppError("You are not logged in!", 401));
  }
  const { password, confirmPassword } = req.body;
  if (password || confirmPassword) {
    return next(new AppError("This is not for password update!", 400));
  }

  const filteredBody = filterObj(req.body, "name", "email");
  const user = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(201).json({
    status: "success",
    data: {
      user,
    },
  });
});

exports.deleteProfile = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: "success",
    data: null,
  });
});
