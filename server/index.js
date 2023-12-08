const express = require("express");
const morgan = require("morgan");
const router = require("./routes.js");
require("dotenv").config();
const app = express();

app.use(morgan("dev"));
app.use(express.json());

app.use("/", router);

const PORT = process.env.PORT || 8080;
app.listen(PORT, (err) => {
  if (err) console.error(err);
  else console.log(`Server running on port:${PORT}. Better catch it!`);
});
