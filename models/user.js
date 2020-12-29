const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, "Please tell us your name"],
  },
  imageUrl: String,
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
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
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  passwordChangedAfter: Date,
  passwordResetToken: String,
  passwordResetTokenExpires: Date,
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.confirmPassword, 12);

  this.confirmPassword = undefined;
  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAfter = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
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

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model("User", userSchema);
