const router = require("express").Router();
const controllers = require("./controllers.js");

router.get(
  "/qa/questions/:question_id/answers",
  controllers.getQuestionAnswers,
);
router.get("/qa/questions/:product_id/:page/:count", controllers.getQuestions);
router.get("/qa/questions/:product_id/:page", controllers.getQuestions);
router.get("/qa/questions/:product_id", controllers.getQuestions);

router.post("/qa/questions", controllers.addQuestion);
router.post("/qa/questions/:question_id/answers", controllers.addAnswer);

router.put(
  "/qa/questions/:question_id/helpful",
  controllers.addQuestionHelpful,
);
router.put("/qa/questions/:question_id/report", controllers.reportQuestion);
router.put("/qa/answers/:answer_id/helpful", controllers.addAnswerHelpful);
router.put("/qa/answers/:answer_id/report", controllers.reportQuestion);

module.exports = router;
