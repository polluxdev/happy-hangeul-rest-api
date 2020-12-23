const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");

dotenv.config();

const database = require("./config/database");

const wordRoutes = require("./routes/word");

const app = express();
const port = process.env.PORT || 3000;
const apiVersion = process.env.API_VERSION;

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors());

app.use(apiVersion + "/words", wordRoutes);

app.use((error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  const status = error.status || "fail";
  const message = error.message;
  const data = error.data;

  res.status(statusCode).json({ status: status, message: message, data: data });
});

mongoose.connect(database.uri, database.options, (err) => {
  if (err) {
    console.error("FAILED TO CONNECT TO MONGODB!");
    console.error(err);
  } else {
    console.log("CONNECTED TO MONGODB!");
  }
});

app.listen(port);
