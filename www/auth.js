const config = require('../config/appConf');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID: config.admin.googleClientId,
      clientSecret: config.admin.googleClientSecret,
      callbackURL: config.admin.authCallback,
      passReqToCallback: true,
    },
    (request, accessToken, refreshToken, profile, done) => {
      // Store user profile in the session or database
      return done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});
