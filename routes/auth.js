const express = require("express");

const authController = require("../controllers/auth");

const router = express.Router();

router.post("/signup", authController.signup);

router.post("/login", authController.login);

router.post("/forgotPassword", authController.forgotPassword);

router.patch("/resetPassword/:token", authController.resetPassword);

router.patch(
  "/updatePassword",
  authController.protectRoute,
  authController.updatePassword
);

module.exports = router;
