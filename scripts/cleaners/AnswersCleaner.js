const csv = require("csv-parser");
const createCsvStringifier = require("csv-writer").createObjectCsvStringifier;
const fs = require("fs");
const { pipeline } = require("stream");
const Transform = require("stream").Transform;

const csvStringifier = createCsvStringifier({
  header: [
    { id: "id", title: "id" },
    { id: "question_id", title: "question_id" },
    { id: "body", title: "body" },
    { id: "date_written", title: "created_at" },
    { id: "answerer_name", title: "answerer_name" },
    { id: "answerer_email", title: "answerer_email" },
    { id: "reported", title: "reported" },
    { id: "helpful", title: "helpfulness" },
  ],
});

const readStream = fs.createReadStream("./../../CSVs/answers.csv");
const writeStream = fs.createWriteStream("./../../CSVs/cleanAnswers.csv");

class CSVCleaner extends Transform {
  constructor(options) {
    super(options);
  }

  _transform(row, encoding, next) {
    for (const key in row) {
      const trimKey = key.trim();
      row[trimKey] = row[key];
      if (key !== trimKey) delete row[key];
    }

    if (!row.date_written) row.date_written = new Date();
    else row.date_written = new Date(+row.date_written);

    row.reported = row.reported ? !!+row.reported : false;

    if (current % 500000 === 0) console.log(current);
    if (current !== +row.id) console.log(`mismatch on ${current} ${row.id}`);
    if (
      !row.id ||
      !row.question_id ||
      !row.body ||
      !row.date_written ||
      !row.answerer_name ||
      !row.answerer_email ||
      row.reported === undefined ||
      !row.helpful
    )
      console.log("Something is missing here =>", row);

    row = csvStringifier.stringifyRecords([row]);
    current++;
    this.push(row);
    next();
  }
}

console.time("Clean Process");
console.log("Cleaning process started");
let current = 1;

const transformer = new CSVCleaner({ writableObjectMode: true });
writeStream.write(csvStringifier.getHeaderString());

pipeline(readStream, csv(), transformer, writeStream, (err) => {
  if (err) {
    console.error("Pipeline failed:", err);
  } else {
    console.log("Clean completed");
    console.timeEnd("Clean Process");
  }
});
