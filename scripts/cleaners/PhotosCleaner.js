const csv = require("csv-parser");
const createCsvStringifier = require("csv-writer").createObjectCsvStringifier;
const fs = require("fs");
const { pipeline } = require("stream");
const Transform = require("stream").Transform;

const csvStringifier = createCsvStringifier({
  header: [
    { id: "id", title: "id" },
    { id: "answer_id", title: "answer_id" },
    { id: "url", title: "url" },
  ],
});

const readStream = fs.createReadStream("./../../CSVs/answers_photos.csv");
const writeStream = fs.createWriteStream("./../../CSVs/cleanPhotos.csv");

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

    if (current !== +row.id)
      console.log(`mismatch on ${current} ${row.id} ${row.answer_id}`);
    current++;
    if (current % 500000 === 0) console.log(current);
    if (!row.id || !row.answer_id || !row.url)
      console.log("Something is missing here =>", row);

    row = csvStringifier.stringifyRecords([row]);
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
