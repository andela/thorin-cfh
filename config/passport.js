import mongoose from 'mongoose';

const LocalStrategy = require('passport-local').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

const User = mongoose.model('User');
const config = require('./config');

require('dotenv').config();


module.exports = function (passport) {
  // Serialize sessions
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findOne({
      _id: id
    }, (err, user) => {
      user.email = null;
      user.facebook = null;
      user.hashed_password = null;
      done(err, user);
    });
  });

  // Use local strategy
  passport.use(new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    ((email, password, done) => {
      User.findOne({
        email
      }, (err, user) => {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false, {
            message: 'Unknown user'
          });
        }
        if (!user.authenticate(password)) {
          return done(null, false, {
            message: 'Invalid password'
          });
        }
        user.email = null;
        user.hashed_password = null;
        return done(null, user);
      });
    })
  ));

  // Use twitter strategy
  passport.use(new TwitterStrategy(
    {
      consumerKey: process.env.TWITTER_CONSUMER_KEY,
      consumerSecret: process.env.TWITTER_CONSUMER_SECRET, // eslint-disable-line
      callbackURL: process.env.TWITTER_CALLBACK,
      userProfileURL: 'https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true' // eslint-disable-line
    },
    ((token, tokenSecret, profile, done) => {
      User.findOne({
        'twitter.id_str': profile.id
      }, (err, user) => {
        if (err) {
          return done(err);
        }
        if (!user) {
          user = new User({
            name: profile.displayName,
            username: profile.username,
            provider: 'twitter',
            twitter: profile._json, // eslint-disable-line
            imageUrl: profile._json.profile_image_url, // eslint-disable-line
            email: profile._json.email,
          });
          user.save((err) => {
            if (err) console.log(err);
            return done(err, user);
          });
        } else {
          return done(err, user);
        }
      });
    })
  ));

  // Use facebook strategy
  passport.use(new FacebookStrategy(
    {
      clientID: process.env.FB_CLIENT_ID,
      clientSecret: process.env.FB_CLIENT_SECRET,
      callbackURL: process.env.FB_CALLBACK
    },
    ((accessToken, refreshToken, profile, done) => {
      User.findOne({
        'facebook.id': profile.id
      }, (err, user) => {
        if (err) {
          return done(err);
        }
        if (!user) {
          user = new User({
            email: (profile.emails && profile.emails[0].value) || '',
            username: profile.username,
            provider: 'facebook',
            facebook: profile._json, // eslint-disable-line
            imageUrl: profile._json.picture || profile.photos[0].value // eslint-disable-line
          });
          user.save((err) => {
            if (err) console.log(err);
            return done(err, user);
          });
        } else {
          return done(err, user);
        }
      });
    })
  ));

  // Use google strategy
  passport.use(new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK,
    },
    ((accessToken, refreshToken, profile, done) => {
      User.findOne({
        'google.id': profile.id
      }, (err, user) => {
        if (err) {
          return done(err);
        }
        if (!user) {
          user = new User({
            name: profile._json.name,
            email: profile._json.name.email,
            username: profile._json.name,
            provider: 'google',
            google: profile._json, // eslint-disable-line
            imageUrl: profile._json.picture // eslint-disable-line
          });
          user.save((err) => {
            if (err) console.log(err);
            return done(err, user);
          });
        } else {
          return done(err, user);
        }
      });
    })
  ));
};
