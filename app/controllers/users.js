/* eslint-disable prefer-arrow-callback */
/* eslint-disable valid-jsdoc */

/**
 * Module dependencies.
 */
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

require('dotenv').config({ path: '.env' });

const User = mongoose.model('User');


/**
 * Show login form
 */
exports.signin = function (req, res) {
  if (!req.user) {
    res.redirect('/#!/signin?error=invalid');
  } else {
    res.redirect('/');
  }
};

/**
 * Show sign up form
 */
exports.signup = function (req, res) {
  if (!req.user) {
    res.redirect('/#!/signup');
  } else {
    res.redirect('/#!/app');
  }
};

exports.loginSuccess = (req, res) => {
  const token = jwt.sign(
    { user: req.user }, process.env.SECRET,
    { expiresIn: 86400 }
  );
  return res.status(200).json({
    status: 'success',
    message: 'Login Successful',
    data: {
      token,
      authenticated: true,
      user: req.user
    }
  });
};

exports.loginFailure = (err, req, res) =>
  res.status(401).json({
    status: 'error',
    message: 'Login Failed. Invalid email or password',
    data: {
      token: '',
      authenticated: false,
      user: null
    }
  });

/**
 * Logout
 */
exports.signout = function (req, res) {
  req.logout();
  res.render('index', {
    user: null,
    token: ''
  });
};

/**
 * Session
 */
exports.session = function (req, res) {
  res.redirect('/');
};

/**
 * Create user
 */
exports.create = function (req, res, next) {
  if (req.body.name && req.body.password && req.body.email) {
    User.findOne({
      email: req.body.email
    }).exec((err, existingUser) => {
      if (!existingUser) {
        var user = new User(req.body); //eslint-disable-line
        user.provider = 'local';
        user.save(function (err) {
          if (err) {
            return res.render('/#!/signup?error=unknown', {
              errors: err.errors,
              user
            });
          }
          req.logIn(user, function (err) {
            if (err) return next(err);
            return res.redirect('/#!/');
          });
        });
      } else {
        return res.redirect('/#!/signup?error=existinguser');
      }
    });
  } else {
    return res.redirect('/#!/signup?error=incomplete');
  }
};


exports.createUser = function (req, res) {
  const {
    username, password, email, imageUrl, publicId
  } = req.body;
  const newUser = new User(req.body);
  newUser.provider = 'local';
  newUser.save(function (err) {
    if (err) {
      return res.status(409).json({
        error: 'Error',
        message: 'A user with that email already exist',
        err
      });
    }
    const user = {
      _id: newUser._id, // eslint-disable-line no-underscore-dangle
      imageUrl: newUser.imageUrl,
      username: newUser.username
    };
    const token = jwt.sign({ user }, process.env.SECRET);
    res.status(201).json({
      message: 'Success',
      user: {
        _id: newUser._id, // eslint-disable-line no-underscore-dangle
        username: newUser.username,
        imageUrl: newUser.imageUrl
      },
      token
    });
  });
};


exports.addDonation = function (req, res) {
  if (req.body && req.user && req.user._id) { //eslint-disable-line
    // Verify that the object contains crowdrise data
    if (req.body.amount && req.body.crowdrise_donation_id
       && req.body.donor_name) {
      User.findOne({
        _id: req.user._id //eslint-disable-line
      })
        .exec((err, user) => {
        // Confirm that this object hasn't already been entered
          let duplicate = false;
          for (let i = 0; i < user.donations.length; i++) { //eslint-disable-line
            if (user.donations[i].crowdrise_donation_id
              === req.body.crowdrise_donation_id) {
              duplicate = true;
            }
          }
          if (!duplicate) {
            user.donations.push(req.body);
            user.premium = 1;
            user.save();
          }
        });
    }
  }
  res.send();
};

/**
 *  Show profile
 */
exports.show = function (req, res) {
  const user = req.profile;

  res.render('users/show', {
    title: user.name,
    user
  });
};

/**
 * Send User
 */
exports.me = function (req, res) {
  res.jsonp(req.user || null);
};

/**
 * Find user by id
 */
exports.user = function (req, res, next, id) {
  User
    .findOne({
      _id: id
    })
    .exec((err, user) => {
      if (err) return next(err);
      if (!user) return next(new Error(`Failed to load User ${id}`));
      req.profile = user;
      next();
    });
};
