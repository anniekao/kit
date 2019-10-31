require("dotenv").config();

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");

const { Pool } = require("pg");
const dbParams = require("./lib/db.js");

// const db = new Pool(dbParams);

const db = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
  ssl: true
});

const PORT = process.env.PORT || 5000;
db.connect((err, client) => {
  if (!err) {
    console.log("successfully connect to database");
  }
});

app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(PORT, () => {
  console.log(`Successfully connected to ${PORT}`);
});
