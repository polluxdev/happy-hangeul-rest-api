const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const User = require("../models/user");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const sendEmail = require("../utils/email");

const signToken = (user) => {
  return jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_TOKEN_SECRET_KEY,
    { expiresIn: process.env.JWT_TOKEN_EXPIRED_TIMEOUT }
  );
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRED_TIMEOUT * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);

  res.status(statusCode).json({
    status: "success",
    token,
  });
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

  createSendToken(user, 201, res);
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

  createSendToken(user, 200, res);
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(
      new AppError("No User registered with the email address!", 404)
    );
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get("host")}${
    process.env.API_VERSION
  }/auth/resetPassword/${resetToken}`;

  const message = `Forgot your password?
  Submit a PATCH request with your new password and confirm password to : ${resetURL}.
  If you did not forget your password, please ignore this email.`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token.",
      message,
    });

    res.status(200).json({
      status: "succes",
      message: "Token sent to email!",
      token: resetToken,
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        "There was an error during sending email! Pleas try again later.",
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("Token is invalid or has expired!", 400));
  }

  const { password, confirmPassword } = req.body;
  user.password = password;
  user.confirmPassword = confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;

  await user.save();

  createSendToken(user, 201, res);
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
    process.env.JWT_TOKEN_SECRET_KEY
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

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError("You don't have permission!", 403));
    }

    next();
  };
};

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("+password");
  const { currentPassword, password, confirmPassword } = req.body;

  if (!(await user.correctPassword(currentPassword, user.password))) {
    return next(new AppError("Your current password is wrong!", 401));
  }

  user.password = password;
  user.confirmPassword = confirmPassword;
  await user.save();

  createSendToken(user, 201, res);
});
