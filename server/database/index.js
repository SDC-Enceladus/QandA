require("dotenv").config();
const mongoose = require("mongoose");
const DB_URL = process.env.DB_URL || "localhost";
const DB_PORT = process.env.DB_PORT || "27017";
const DB_NAME = process.env.DB_NAME || "enceladus";
const DB_USER = process.env.DB_USER || "admin";
const DB_PASS = process.env.DB_PASS || "password";

mongoose
  .connect(`mongodb://${DB_USER}:${DB_PASS}@${DB_URL}:${DB_PORT}/${DB_NAME}`)
  .then(() => console.log("Successfully connected to DB"))
  .catch((err) => console.error(err));

console.log(`mongodb://${DB_USER}:${DB_PASS}@${DB_URL}:${DB_PORT}/${DB_NAME}`);

module.exports = mongoose.connection;
