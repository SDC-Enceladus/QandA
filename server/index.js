const express = require("express");
const morgan = require("morgan");
const router = require("./routes.js");
const myCache = require("./middleware/cache.js");
require("./database/index.js");
require("dotenv").config();
const app = express();

const cacheMiddleware = (req, res, next) => {
  const cacheKey = req.orIginalUrl || req.url;
  const cachedData = myCache.get(cacheKey);

  if (cachedData) res.json(cachedData);
  else {
    res.sendResponse = res.send;
    res.send = (body) => {
      myCache.set(cacheKey, body, 300);
      res.sendResponse(body);
    };
    next();
  }
};

app.use(morgan("dev"));
app.use(express.json());
app.use("/", cacheMiddleware);

app.use("/", router);

const PORT = process.env.PORT || 8080;
app.listen(PORT, (err) => {
  if (err) console.error(err);
  else console.log(`Server running on port:${PORT}. Better catch it!`);
});
