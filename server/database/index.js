const mongoose = require("mongoose");
const DB_URL = process.env.DB_URL || "localhost";
const PORT = process.env.PORT || 27017;
const DB_NAME = process.env.DB_NAME || "enceladus";

mongoose.connect(`mongodb://${DB_URL}:${PORT}/${DB_NAME}`);

module.exports = mongoose;
