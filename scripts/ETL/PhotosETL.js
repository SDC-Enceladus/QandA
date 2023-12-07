const fs = require("fs");
const { parse } = require("fast-csv");
const { Photos } = require("./../../server/models.js");

let current = 0;
let foo = 0;
let batch = [];

const processBatch = async (input) => {
  try {
    await Photos.bulkCreate(input);
  } catch (error) {
    console.error("Error upserting batch", error);
  }
};

const ETL = async () => {
  console.time("ETL Process");
  const data = fs
    .createReadStream("./../../CSVs/cleanPhotos.csv")
    .pipe(parse({ headers: true }))
    .on("error", (err) => {
      console.error("Error parsing CSV:", err.message);
    })
    .on("data", async (row) => {
      try {
        if (current < +row.id) batch.push(row);
        current++;
        if (current % 100000 === 0) {
          console.log(current);
          await processBatch(batch.slice(foo, foo + 100000));
          foo += 100000;
        }
      } catch (error) {
        console.error("Error upserting batch", error);
      }
    });

  data.on("end", async () => {
    await processBatch(batch.slice(foo + 1));

    console.log("CSV parsing completed");
    console.timeEnd("ETL Process");
    console.log(`${current} rows added.`);
  });
};

console.time("ETL Process");
ETL();
