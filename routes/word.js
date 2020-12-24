const express = require("express");

const wordController = require("../controllers/word");

const router = express.Router();

router.route("/word-stats").get(wordController.getWordStats);

router.route("/").get(wordController.getWords).post(wordController.postWord);

router
  .route("/:wordId")
  .get(wordController.getWord)
  .patch(wordController.patchWord)
  .delete(wordController.deleteWord);

module.exports = router;
