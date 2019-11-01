require("dotenv").config();
const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports = db => {
  router.post("/", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    // testing
    // const email = "helo";
    // const password = "jello";

    db.query("select * from users where email = $1", [email])
      .then(user => {
        if (user.rowCount !== 1) {
          res.send(403).json({
            auth: false,
            message: "Incorrect name or password"
          });
          throw new Error("Incorrect name or password");
        }
        const hash = user.rows[0].password;
        if (bcrypt.compareSync(password, hash)) {
          const token = jwt.sign({ id: user.id }, process.env.SECRECT_KEY, {
            expiresIn: 86400
          });
          if (token) {
            res.cookie("jwt-token", token);
            res.status(200).json({
              auth: true,
              token: token
            });
          }
        }
      })
      .catch(e => {
        res.status(500).send();
        console.log("Error - " + e);
      });
  });
  return router;
};
