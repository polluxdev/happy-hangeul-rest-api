const { promisify } = require("util");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

const signToken = (user) => {
  return jwt.sign(
    { userId: user._id, email: user.email },
    process.env.TOKEN_SECRET_KEY,
    { expiresIn: process.env.TOKEN_EXPIRED_TIMEOUT }
  );
};

exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, password, confirmPassword } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    confirmPassword,
    passwordChangedAfter: Date.now(),
  });

  const token = signToken(user);

  res.status(201).json({
    message: "User created successfully!",
    data: {
      _id: user._id,
      token,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide email and password", 401));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password!", 401));
  }

  const token = signToken(user);

  res.status(200).json({ message: "Login successfully!", token });
});

exports.protectRoute = catchAsync(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  let token;

  if (authHeader && authHeader.startsWith("Bearer")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("Unauthorized!", 401));
  }

  const decoded = await promisify(jwt.verify)(
    token,
    process.env.TOKEN_SECRET_KEY
  );

  const user = await User.findById(decoded.userId);

  if (!user) {
    return next(new AppError("User does no longer exists!", 401));
  }

  if (user.changePasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password! Please re-login.", 401)
    );
  }

  req.user = user;

  next();
});
