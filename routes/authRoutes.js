const router = require("express").Router();
const passport = require("passport");

module.exports = () => {
  router.get(
    "/",
    passport.authenticate("google", {
      scope: ["profile", "email"]
    })
  );

  router.get(
    "/callback",
    passport.authenticate("google", {
      failureRedirect: "http://localhost:3000/login"
    }),
    (req, res) => {
      console.log("successfully authenticaye");
      res.redirect("/home");
    }
  );
  return router;
};
