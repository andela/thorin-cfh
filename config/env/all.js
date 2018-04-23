var path = require('path'),
rootPath = path.normalize(__dirname + '/../..');
var keys = rootPath + '/keys.txt';
require('dotenv').config()

require('dotenv').config({ path: '.env' });

require('dotenv').config({ path: '.env' });

module.exports = {
	root: rootPath,
	port: process.env.PORT || 3000,
    db: process.env.MONGOHQ_URL
};
