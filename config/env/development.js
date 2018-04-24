require('dotenv').config();

const Info = {
  facebook: {
    clientID: process.env.FB_CLIENT_SECRET,
    clientSecret: process.env.FB_CLIENT_ID
  },
  twitter: {
    clientID: process.env.TWITTER_CONSUMER_KEY,
    clientSecret: process.env.TWITTER_CONSUMER_SECRET
  },
  google: {
    clientID: process.env.GOOGLE_CLIENT_SECRET,
    clientSecret: process.env.GOOGLE_CLIENT_ID
  },
  github: {
    clientID: process.env.GITHUB_CLIENT_SECRET,
    clientSecret: process.env.GITHUB_CLIENT_ID
  },
};
export default Info;
