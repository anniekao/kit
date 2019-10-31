require("dotenv").config();
const router = require("express").Router();
const bcrypt = require("bcrypt");
const saltRounds = 12;
const jwt = require("jsonwebtoken");

module.exports = db => {
  router.post("/", (req, res) => {
    let email = req.body.email;
    let password = req.body.password;

    email = "helo";
    password = "jello";

    db.query(`select * from users where email = $1`, [email])
      .then(resp => {
        if (resp.rowCount !== 0) {
          throw new Error("User already exists");
        }
        bcrypt
          .hash(password, saltRounds)
          .then(hashedPassword => {
            db.query(
              "insert into users (email, password) values ($1, $2) returning *",
              [email, hashedPassword]
            )
              .then(user => {
                if (user.rowCount !== 1) {
                  throw new Error("Error occurs during creationg");
                }
                console.log("im in here " + hashedPassword);
                const token = jwt.sign(
                  { id: user.id },
                  process.env.SECRECT_KEY,
                  { expiresIn: 86400 } //expires in 24 horurs
                );

                if (token) {
                  res.cookie("jwt-token", token);
                  res.status(200).send({ auth: true, token: token });
                }
                console.log("user return is " + JSON.stringify(user));
              })
              .catch(err => {
                res.status(500).send();
                console.log("Error - " + err);
              });
            console.log("hello");
          })
          .catch(e => {
            throw new Error("Error occurs when hashing");
          });
      })
      .catch(err => {
        res.status(500).send();
        console.log("Error - " + err);
      });
  });

  return router;
};
