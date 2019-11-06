const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const keys = require("../config/keys");

module.exports = db => {
  return passport.use(
    new GoogleStrategy(
      {
        clientID: keys.googleClientID,
        clientSecret: keys.googleClientSecret,
        callbackURL: "http://localhost:5000/auth/google/callback"
      },
      async (accessToken, refreshToken, profile, done) => {
        if (!profile) {
          return done("Error while retrieving error profile", null);
        } else if (!accessToken) {
          return done("Error while retrieving access token", null);
        } else {
          const email = profile.emails[0].value;
          const google_id = profile.id;
          const google_social_id = 1;
          let user = null;
          let social_url = null;
          let dummyPW = 123;

          try {
            user = await db.query(`select * from users where email = $1`, [
              email
            ]);
            if (user.rowCount !== 1) {
              // create a new user
              user = await db.query(
                `insert into users (email, password) values ($1, $2) returning *`,
                [email, dummyPW]
              );
              if (user.rowCount !== 1) {
                throw new Error("Error while creating new user");
              }
              // create social url table
              social_url = await db.query(
                `insert into user_social_url (social_media_id, user_id, client_auth_id) values ($1, $2, $3) returning *`,
                [google_social_id, user.rows[0].id, google_id]
              );
              if (social_url.rowCount !== 1) {
                throw new Error("Error while creating social url table");
              }
              done(null, user);
            } else {
              // check to see if they r using oauth 2 login for the first time. if yes create social url table
              social_url = await db.query(
                `select * from user_social_url where user_id = $1`,
                [user.rows[0].id]
              );
              if (social_url.rowCount !== 1) {
                social_url = await db.query(
                  `insert into user_social_url (social_media_id, user_id, client_auth_id) values ($1, $2, $3) returning *`,
                  [google_social_id, user.rows[0].id, google_id]
                );
              }
              done(null, user);
            }
          } catch (err) {
            console.log(err);
            done("Error Oauth2", null, { message: err });
          }
        }
      }
    )
  );
};
