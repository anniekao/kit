const router = require("express").Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");

module.exports = () => {
  router.get(
    "/",
    passport.authenticate("google", { scope: ["profile", "email"] })
  );

  router.get("/callback", function(req, res) {
    console.log("GOOGLE CALLBACK");
    passport.authenticate("google", function(err, profile) {
      if (err) {
        res.redirect("http://localhost:3000/login");
      }
      // we are essentially encryting client auth id as our jwt, i duno if its the best solution
      const token = jwt.sign(
        { id: profile.rows[0].id },
        process.env.SECRET_KEY,
        {
          expiresIn: 86400
        }
      );
      res.cookie("access_token", token);
      req.session.currentUser = { user: profile.rows[0], token: token };

      req.session.secure = false;
      res.status(302).redirect("http://localhost:3000/home");
    })(req, res); // you to call the function retuned by passport.authenticate, with is a midleware.
  });

  return router;
};
