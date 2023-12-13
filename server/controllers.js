const Questions = require("./models/Questions");
const Answers = require("./models/Answers");
const Photos = require("./models/Photos");
const Ids = require("./models/Id");
const myCache = require("./middleware/cache");

const checkCache = (key) => myCache.get(key);
const addCache = (key, data) => myCache.set(key, data, 60);

module.exports = {
  getQuestions: async (req, res) => {
    const product_id = +req.params.product_id;
    const page = +req.params.page || 1;
    const count = +req.params.count || 5;
    const response = {};

    if (!product_id) {
      response.error = "Bad Request";
      response.message = "Required information is missing or invalid.";
      res.status(400).json(response);
      return;
    }

    const key = req.originalUrl || req.url;
    const cached = checkCache(key);
    if (cached) {
      res.status(200).json(cached);
      return;
    }

    response.product_id = product_id;

    try {
      const results = await Questions.aggregate([
        {
          $match: {
            product_id: product_id,
          },
        },
        {
          $skip: (page - 1) * count,
        },
        {
          $limit: count,
        },
        {
          $project: {
            _id: 0,
            question_id: "$id",
            question_body: "$body",
            question_date: "$created_at",
            asker_name: 1,
            reported: 1,
            question_helpfulness: "$helpfulness",
          },
        },
        {
          $lookup: {
            from: "answers",
            localField: "question_id",
            foreignField: "question_id",
            as: "answers",
          },
        },
        {
          $unwind: {
            path: "$answers",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "photos",
            localField: "answers.id",
            foreignField: "answer_id",
            as: "answers.photos",
          },
        },
        {
          $group: {
            _id: "$question_id",
            question_id: { $first: "$question_id" },
            question_body: { $first: "$question_body" },
            question_date: { $first: "$question_date" },
            asker_name: { $first: "$asker_name" },
            reported: { $first: "$reported" },
            question_helpfulness: { $first: "$question_helpfulness" },
            answers: {
              $push: {
                $cond: [
                  {
                    $or: [
                      { $eq: ["$answers.id", null] },
                      { $eq: [{ $size: "$answers.photos" }, 0] },
                    ],
                  },
                  null,
                  {
                    id: "$answers.id",
                    body: "$answers.body",
                    date: "$answers.created_at",
                    answerer_name: "$answers.answer_name",
                    helpfulness: "$answers.helpfulness",
                    photos: {
                      $map: {
                        input: "$answers.photos",
                        as: "photo",
                        in: {
                          id: "$$photo.id",
                          url: "$$photo.url",
                        },
                      },
                    },
                  },
                ],
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            question_id: 1,
            question_body: 1,
            question_date: 1,
            asker_name: 1,
            reported: 1,
            question_helpfulness: 1,
            answers: {
              $arrayToObject: {
                $map: {
                  input: {
                    $filter: {
                      input: "$answers",
                      as: "answer",
                      cond: { $ne: ["$$answer", null] },
                    },
                  },
                  as: "answer",
                  in: {
                    k: { $toString: "$$answer.id" },
                    v: "$$answer",
                  },
                },
              },
            },
          },
        },
      ]);

      response.results = results;
      console.log(response);
      res.status(200).json(response);
      addCache(key, response, 60);
    } catch (err) {
      console.log(err);
      res.sendStatus(400);
    }
  },

  getQuestionAnswers: async (req, res) => {
    const question_id = +req.params.question_id;
    const page = +req.query.page || 1;
    const count = +req.query.count || 5;
    const response = {};

    if (!question_id) {
      response.error = "Bad Request";
      response.message = "Required information is missing or invalid.";
      res.status(400).json(response);
      return;
    }

    response.question = question_id;
    response.page = page;
    response.count = count;

    const key = req.originalUrl || req.url;
    const cached = checkCache(key);
    if (cached) {
      res.status(200).json(cached);
      return;
    }

    try {
      const results = await Answers.aggregate([
        {
          $match: { question_id: question_id },
        },
        {
          $skip: (page - 1) * count,
        },
        {
          $limit: count,
        },
        {
          $project: {
            _id: 0,
            id: 1,
            body: 1,
            created_at: 1,
            answerer_name: 1,
            helpfulness: 1,
          },
        },
        {
          $lookup: {
            from: "photos",
            localField: "id",
            foreignField: "answer_id",
            as: "photos",
          },
        },
        {
          $unwind: {
            path: "$photos",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 0,
            answer_id: "$id",
            body: 1,
            date: "$created_at",
            answerer_name: 1,
            helpfulness: 1,
            photos: {
              url: 1,
              id: 1,
            },
          },
        },
        {
          $group: {
            _id: "$answer_id",
            answer_id: { $first: "$answer_id" },
            body: { $first: "$body" },
            date: { $first: "$date" },
            answerer_name: { $first: "$answerer_name" },
            helpfulness: { $first: "$helpfulness" },
            photos: { $push: "$photos" },
          },
        },
        {
          $project: {
            answer_id: 1,
            body: 1,
            date: 1,
            answerer_name: 1,
            helpfulness: 1,
            photos: 1,
          },
        },
      ]);

      response.results = results;
      res.status(200).json(response);
      addCache(key, response, 60);
    } catch (err) {
      console.error(err);
      res.sendStatus(400);
    }
  },

  addQuestion: async (req, res) => {
    const body = req.body.body || "";
    const asker_name = req.body.name || "";
    const asker_email = req.body.email || "";
    const product_id = req.body.product_id || 0;

    if (!(asker_name.length && body.length && product_id)) {
      const response = {};
      response.error = "Bad Request";
      response.message = "Required information is missing or invalid.";
      res.status(400).json(response);
      return;
    }

    try {
      const data = await Ids.findOneAndUpdate(
        { type: "questions" },
        { $inc: { id: 1 } },
      ).lean();
      const toInsert = {
        product_id,
        body,
        asker_name,
        id: data.id,
      };
      if (asker_email.length) toInsert.asker_email = asker_email;
      const results = await Questions.create(toInsert);
      res.status(201).json(results);
    } catch (err) {
      console.error(err);
      res.sendStatus(400);
    }
  },

  addAnswer: async (req, res) => {
    const body = req.body.body || "";
    const answerer_name = req.body.name || "";
    const answerer_email = req.body.email || "";
    const question_id = req.params.question_id || 0;
    const photos = req.body.photos || [];

    if (!(answerer_name.length && body.length && question_id)) {
      const response = {};
      response.error = "Bad Request";
      response.message = "Required information is missing or invalid.";
      res.status(400).json(response);
      return;
    }

    try {
      const data = await Ids.find({
        type: { $in: ["answers", "photos"] },
      }).lean();
      let answersId = data[1].id;
      let photosId = data[0].id;
      if (data[0].type === "answers") {
        answersId = data[0].id;
        photosId = data[1].id;
      }
      const toInsert = {
        id: answersId,
        question_id,
        body,
        answerer_name,
      };
      if (answerer_email.length) toInsert.answerer_email = answerer_email;
      const response = await Answers.create(toInsert);
      await Ids.findOneAndUpdate({ type: "answers" }, { $inc: { id: 1 } });
      const photosToInsert = [];
      for (let i = 0; i < photos.length; i++) {
        const photo = {
          id: photosId + i,
          answer_id: answersId,
          url: photos[i],
        };
        photosToInsert.push(photo);
      }
      await Photos.insertMany(photosToInsert);
      await Ids.findOneAndUpdate(
        { type: "photos" },
        { $inc: { id: photosToInsert.length } },
      );
      response.photos = photosToInsert;
      res.status(201).json(response);
    } catch (err) {
      console.error(err);
      res.sendStatus(400);
    }
  },

  addQuestionHelpful: async (req, res) => {
    const id = req.params.question_id;

    if (!id) {
      const response = {};
      response.error = "Bad Request";
      response.message = "Required information is missing or invalid.";
      res.status(400).json(response);
    }

    try {
      await Questions.updateOne({ id }, { $inc: { helpfulness: 1 } });
      res.sendStatus(204);
    } catch (err) {
      console.error(err);
      res.sendStatus(500);
    }
  },

  reportQuestion: async (req, res) => {
    const id = req.params.question_id;

    if (!id) {
      const response = {};
      response.error = "Bad Request";
      response.message = "Required information is missing or invalid.";
      res.status(400).json(response);
    }
    try {
      await Questions.updateOne({ id }, { $set: { reported: true } });
      res.sendStatus(204);
    } catch (err) {
      console.error(err);
      res.sendStatus(500);
    }
  },

  addAnswerHelpful: async (req, res) => {
    const id = req.params.answer_id;

    if (!id) {
      const response = {};
      response.error = "Bad Request";
      response.message = "Required information is missing or invalid.";
      res.status(400).json(response);
    }

    try {
      await Answers.updateOne({ id }, { $inc: { helpfulness: 1 } });
      res.sendStatus(204);
    } catch (err) {
      console.error(err);
      res.sendStatus(500);
    }
  },

  reportAnswer: async (req, res) => {
    const id = req.params.answer_id;

    if (!id) {
      const response = {};
      response.error = "Bad Request";
      response.message = "Required information is missing or invalid.";
      res.status(400).json(message);
    }

    try {
      await Answers.updateOne({ id }, { $set: { reported: true } });
      res.sendStatus(204);
    } catch (err) {
      console.error(err);
      res.sendStatus(500);
    }
  },
};
