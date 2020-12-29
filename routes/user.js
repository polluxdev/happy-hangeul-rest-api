const express = require("express");

const authController = require("../controllers/auth");
const userController = require("../controllers/user");

const router = express.Router();

router
  .route("/")
  .get(
    authController.protectRoute,
    authController.restrictTo("user"),
    userController.getUsers
  )
  .post(
    authController.protectRoute,
    authController.restrictTo("user"),
    userController.postUser
  );

router.patch(
  "/updateProfile",
  authController.protectRoute,
  userController.updateProfile
);

router.delete(
  "/deleteProfile",
  authController.protectRoute,
  userController.deleteProfile
);

router
  .route("/:userId")
  .get(userController.getUser)
  .patch(authController.restrictTo("user"), userController.patchUser)
  .delete(authController.restrictTo("user"), userController.deleteUser);

module.exports = router;
