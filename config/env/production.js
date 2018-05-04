require('dotenv').config();

module.exports = {
  app: {
    name: 'Cards for Humanity - Development'
  },
  facebook: {
    callbackURL: process.env.FB_CALLBACK
  },
  twitter: {
    callbackURL: process.env.TWITTER_CALLBACK
  },
  google: {
    callbackURL: process.env.GOOGLE_CALLBACK
  }
};
