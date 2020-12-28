const express = require("express");

const wordController = require("../controllers/word");
const authController = require("../controllers/auth");

const router = express.Router();

router.route("/word-stats").get(wordController.getWordStats);

router.route("/").get(authController.protectRoute, wordController.getWords).post(authController.protectRoute, wordController.postWord);

router
  .route("/:wordId")
  .get(wordController.checkWord, wordController.getWord)
  .patch(wordController.checkWord, wordController.patchWord)
  .delete(wordController.checkWord, wordController.deleteWord);

module.exports = router;
