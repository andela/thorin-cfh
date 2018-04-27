import path from 'path';

const rootPath = path.normalize(`${__dirname}/../..`);

require('dotenv').config({ path: '.env' });

module.exports = {
  root: rootPath,
  port: process.env.PORT,
  db: process.env.MONGOHQ_URL
};
