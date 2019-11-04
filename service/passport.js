const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const keys = require("../config/keys");

passport.use(
  new GoogleStrategy(
    {
      clientID: keys.googleClientID,
      clientSecret: keys.googleClientSecret,
      callbackURL: "http://localhost:5000/auth/google/callback"
    },
    (accessToken, refreshToken, profile, done) => {
      console.log("access token is " + accessToken);
      console.log("refresh token is " + refreshToken);
      console.log("profile is " + JSON.stringify(profile));

      // done();
    }
  )
  // ,
  // (accessToken, refreshToken, profile, done) => {
  //   console.log("access token is " + accessToken);
  //   console.log("refresh token is " + refreshToken);
  //   console.log("profile is " + JSON.stringify(profile));
  // }
);
