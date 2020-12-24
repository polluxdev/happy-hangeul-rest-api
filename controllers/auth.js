const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

exports.signup = async (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  try {
    const checkUser = User.findOne({ email });
    if (checkUser) {
      return res.status(409).json({ message: "Email has already exist!" });
    }
    if (password !== confirmPassword) {
      return res.status(409).json({ message: "Password does not match!" });
    }
    const hashedPw = await bcrypt.hash(confirmPassword, 12);
    const user = User.create({
      name: name,
      email: email,
      password: hashedPw,
    });
    res.status(201).json({
      message: "User created successfully!",
      data: {
        _id: user._id,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  try {
    const checkUser = await User.findOne({ email: email });
    if (!checkUser) {
      return res.status(401).json({ message: "Auth failed!" });
    }
    const isPwEqual = await bcrypt.compare(password, checkUser.password);
    if (isPwEqual) {
      const token = await jwt.sign(
        { userId: user._id, email: user.email },
        process.env.TOKEN_SECRET_KEY,
        { expiresIn: process.env.TOKEN_EXPIRED_TIMEOUT }
      );
      return res
        .status(200)
        .json({ message: "Login successfully!", token: token });
    }
    res.status(401).json({ message: "Auth failed!" });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
