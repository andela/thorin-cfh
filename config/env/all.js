import path from 'path';

const rootPath = path.normalize(`${__dirname}/../..`);

require('dotenv').config({ path: '.env' });

module.exports = {
  root: rootPath,
  port: process.env.PORT,
  db: 'mongodb://amara:12345triumph@ds211440.mlab.com:11440/cfh-db'
};
