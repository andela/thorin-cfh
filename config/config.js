/* eslint-disable */
import _ from 'underscore';

// Load app configuration

module.exports = _.extend(
  require('../config/env/all.js'), 
  require(`./env/${process.env.NODE_ENV}`) || {}
);
