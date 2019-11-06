require("dotenv").config();

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");
const { Pool } = require("pg");
const PORT = process.env.PORT || 5000;
const cors = require("cors");
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");

app.use(morgan("dev"));
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000"
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(methodOverride("_method"));

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

require("./service/passport")(db);

// routing
const signupRoutes = require("./routes/signupRoutes");
const loginRoutes = require("./routes/loginRoutes");
const authRoutes = require("./routes/authRoutes");
const eventFeedRoutes = require("./routes/eventFeedRoutes");
const eventHistoryRoutes = require("./routes/eventHistoryRoutes");
const userRoutes = require("./routes/userRoutes");
app.use("/signup", signupRoutes(db));
app.use("/login", loginRoutes(db));
app.use("/auth/google", authRoutes(db));
app.use("/events", eventFeedRoutes());
app.use("/users", eventHistoryRoutes(db));
app.use("/users", userRoutes(db));

app.listen(PORT, () => {
  console.log(`Successfully connected to ${PORT}`);
});
