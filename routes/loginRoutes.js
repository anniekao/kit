require("dotenv").config();
const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports = db => {
  router.post("/", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    console.log("email" + email);
    console.log("password" + password);
    console.log("LOGGING IN!!!!")

    db.query("select * from users where email = $1", [email])
      .then(user => {
        if (user.rowCount !== 1) {
          throw new Error("Incorrect email or password");
        }
        const hash = user.rows[0].password;
        if (bcrypt.compareSync(password, hash)) {
          const token = jwt.sign({ id: user.id }, process.env.SECRET_KEY, {
            expiresIn: 86400
          });
          if (token) {
            // res.header("Access-Control-Allow-Credentials", true);
            res.cookie("access_token", token, {
              maxAge: 900000
              // httpOnly: true
            });
            res.status(200).json({
              auth: true,
              data: { 
                id: user.rows[0].id,
                name: user.rows[0].first_name + " " + user.rows[0].last_name
              },
              token: token
            });
          }
        } else {
          throw newError("Wrong password")
        }
        // return "";
      })
      .catch(err => {
        res.status(401).json({ message: "Incorrect name or password" });
        // return "";
      });
  });
  return router;
};
