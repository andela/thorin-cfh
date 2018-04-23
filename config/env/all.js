const path = require('path');

const rootPath = path.normalize(`${__dirname}/../..`);

// let keys = `${rootPath  }/keys.txt`;

require('dotenv').config({ path: '.env' });

module.exports = {
  root: rootPath,
  port: process.env.PORT || 3000,
  db: process.env.MONGOHQ_URL
};
