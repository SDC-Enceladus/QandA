const sequelize = require("../server/database/index.js");
const Answer = require("../server/models/Answer.js");
const Question = require("../server/models/Question.js");
const Photo = require("../server/models/Photo.js");

async function setupTable() {
  try {
    Question.hasMany(Answer, { foreignKey: "question_id" });
    Answer.belongsTo(Question, { foreignKey: "question_id" });
    Answer.hasMany(Photo, { foreignKey: "answer_id" });
    Photo.belongsTo(Answer, { foreignKey: "answer_id" });

    await sequelize.sync();

    console.log("Tables set up successfully DOOD");
  } catch (error) {
    console.error("Error setting up table:", error.message);
  }
}

setupTable();
