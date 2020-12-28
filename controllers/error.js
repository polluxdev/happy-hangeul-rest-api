const AppError = require("../utils/appError");

const sendErrorDev = (error, res) => {
  console.log(error);
  res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
    error: error,
    stack: error.stack,
  });
};

const sendErrorProd = (error, res) => {
  if (error.isOperational) {
    res
      .status(error.statusCode)
      .json({ status: error.status, message: error.message });
  } else {
    console.log("Error occured!", error);
    res.status(500).json({
      status: "error",
      message: "Something went wrong!",
    });
  }
};

const handleCastErrorDB = (error) => {
  const err = new AppError(`Invalid ${error.path}: ${error.value}.`, 400);
  return err;
};

const handleDuplicateErrorDB = (error) => {
  const message = Object.values(error.keyValue);
  console.log(error);

  const err = new AppError(
    `Duplicate field value: ${message}. Please use another value.`,
    400
  );
  return err;
};

const handleValidationErrorDB = (error) => {
  const errors = Object.values(error.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

const handleJWTError = () => new AppError("Invalid Token!", 401);
const handleExpiredJWTError = () => new AppError("Token Expired!", 401);

module.exports = (error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "fail";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(error, res);
  } else {
    let err = { ...error };
    if (err.kind === "ObjectId") err = handleCastErrorDB(err);
    if (err.code === 11000) err = handleDuplicateErrorDB(err);
    if (err.errors) err = handleValidationErrorDB(err);
    if (err.name === "JsonWebTokenError") err = handleJWTError(err);
    if (err.name === "TokenExpiredError") err = handleExpiredJWTError(err);
    sendErrorProd(err, res);
  }
};
