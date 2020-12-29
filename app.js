const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");

dotenv.config();

const database = require("./config/database");

const AppError = require("./utils/appError");

const globalErrorHandler = require("./controllers/error");

const authRoutes = require("./routes/auth");
const wordRoutes = require("./routes/word");
const userRoutes = require("./routes/user");

const app = express();
const port = process.env.PORT || 3000;
const apiVersion = process.env.API_VERSION;

app.use(helmet());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many request from this IP! Please try again in an hour.",
});

app.use(apiVersion, limiter);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: "10kb" }));

app.use(mongoSanitize());

app.use(xss());

app.use(hpp());

app.use(cors());

app.use(apiVersion + "/auth", authRoutes);
app.use(apiVersion + "/words", wordRoutes);
app.use(apiVersion + "/users", userRoutes);

app.all("*", (req, res, next) => {
  const error = new AppError(
    `Can't find ${req.originalUrl} on this server!`,
    404
  );
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

mongoose
  .connect(database.uri, database.options)
  .then(() => {
    console.log("CONNECTED TO MONGODB!");
  })
  .catch(() => {
    console.error("FAILED TO CONNECT TO MONGODB!");
  });

const server = app.listen(port);

process.on("unhandledRejection", (error) => {
  console.log("UNHANDLED REJECTION!");
  console.log(error);

  server.close(() => {
    process.exit(1);
  });
});

process.on("uncaughtException", (error) => {
  console.log("UNCAUGHT EXCEPTION!");
  console.log(error.name, error.message);

  server.close(() => {
    process.exit(1);
  });
});
