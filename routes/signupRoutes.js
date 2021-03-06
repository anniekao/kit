require("dotenv").config();
const router = require("express").Router();
const bcrypt = require("bcrypt");
const saltRounds = 12;
const jwt = require("jsonwebtoken");

module.exports = db => {
  router.post("/", (req, res) => {
    let email = req.body.email;
    let password = req.body.password;

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
                  throw new Error("Incorrect name or password");
                }
                const token = jwt.sign(
                  { id: user.rows[0].id },
                  process.env.SECRET_KEY,
                  { expiresIn: 86400 } //expires in 24 horurs
                );

                if (token) {
                  res.cookie("access_token", token);
                  res.status(200).send({
                    auth: true,
                    token: token,
                    data: {
                      id: user.rows[0].id,
                      name:
                        user.rows[0].first_name + " " + user.rows[0].last_name
                    }
                  });
                }
              })
              .catch(err => {
                res.status(403).json({
                  message: "Incorrect name or password"
                });
              });
          })
          .catch(e => {
            throw new Error("Error occurs when hashing");
          });
      })
      .catch(err => {
        console.log(err);
        res.status(403).json({
          message: "Incorrect name or password"
        });
        return "";
      });
  });

  return router;
};
