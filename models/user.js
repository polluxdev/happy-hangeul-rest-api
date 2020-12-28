const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, "Please tell us your name"],
  },
  imageUrl: String,
  email: {
    type: String,
    required: [true, "Please provide your email address"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email address"],
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: 8,
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, "Please confirm your password"],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "Password does not match",
    },
  },
  passwordChangedAfter: Date,
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.confirmPassword, 12);

  this.confirmPassword = undefined;
  next();
});

userSchema.methods.correctPassword = async function (password, userPassword) {
  return await bcrypt.compare(password, userPassword);
};

userSchema.methods.changePasswordAfter = function (jwtTimestamp) {
  if (this.passwordChangedAfter) {
    const changedTimestamp = +(this.passwordChangedAfter.getTime() / 1000);

    return jwtTimestamp < changedTimestamp;
  }

  return false;
};

module.exports = mongoose.model("User", userSchema);
