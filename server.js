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
const cookieSession = require("cookie-session");

app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000"
  })
);

app.use(
  cookieSession({
    path: "/",
    name: "session",
    keys: [process.env.SECRET_KEY],
    secure: false,
    resave: false,
    maxAge: 900000
  })
);
app.use(morgan("dev"));

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
const authRoutes = require("./routes/authRoutes");
const signupRoutes = require("./routes/signupRoutes");
const loginRoutes = require("./routes/loginRoutes");
const eventFeedRoutes = require("./routes/eventFeedRoutes");
const eventHistoryRoutes = require("./routes/eventHistoryRoutes");
const eventContactsRoutes = require("./routes/eventContactsRoutes");
const userRoutes = require("./routes/userRoutes");
app.use("/signup", signupRoutes(db));
app.use("/login", loginRoutes(db));
app.use("/auth/google", authRoutes(db));
app.use("/events", eventFeedRoutes());
app.use("/users", eventHistoryRoutes(db));
app.use("/users", eventContactsRoutes(db));
app.use("/users", userRoutes(db));

app.listen(PORT, () => {
  console.log(`Successfully connected to ${PORT}`);
});
