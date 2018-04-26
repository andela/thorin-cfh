/* eslint-disable func-names */
/* eslint-disable no-underscore-dangle */
/* eslint-disable prefer-arrow-callback */
/* eslint-disable valid-jsdoc */

/**
 * Module dependencies.
 */
const jwt = require('jsonwebtoken');

require('dotenv').config({ path: '.env' });


/**
 * Redirect users to /#!/app (forcing Angular to reload the page)
 */
exports.play = function (req, res) {
  if (Object.keys(req.query)[0] === 'custom') {
    res.redirect('/#!/app?custom');
  } else {
    res.redirect('/#!/app');
  }
};

exports.render = function (req, res) {
  const token = req.user ? jwt.sign(
    { user: req.user },
    process.env.SECRET, { expiresIn: 86400 }
  ) : '';
  req.session = ''; // Because it now uses jwt
  res.render('index', {
    user: req.user ? JSON.stringify(req.user) : 'null',
    token: JSON.stringify(token)
  });
};
