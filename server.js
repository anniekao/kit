require("dotenv").config();

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");
const { Pool } = require("pg");
const PORT = process.env.PORT || 5000;
const cors = require("cors");

// const cookieSession = require("cookie-session");

app.use(morgan("dev"));
app.use(cors());
app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(
//   cookieSession({
//     name: "session",
//     keys: [process.env.KEY]
//   })
// );

const db = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
  ssl: true
});

db.connect((err, client) => {
  if (!err) {
    console.log("successfully connect to database");
  }
});

// routing
const signupRoutes = require("./routes/signupRoutes");
const loginRoutes = require("./routes/loginRoutes");
app.use("/signup", signupRoutes(db));
app.use("/login", loginRoutes(db));

app.listen(PORT, () => {
  console.log(`Successfully connected to ${PORT}`);
});
