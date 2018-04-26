/* eslint-disable func-names */
/* eslint-disable no-underscore-dangle */
require('dotenv').config({ path: '.env' });

// Generic require login routing middleware
exports.requiresLogin = function (req, res, next) {
  if (!req.isAuthenticated()) {
    return res.send(401, 'User is not authorized');
  }
  next();
};


// User authorizations routing middleware
exports.user = {
  hasAuthorization(req, res, next) {
    if (req.profile.id !== req.user.id) {
      return res.send(401, 'User is not authorized');
    }
    next();
  }
};

