/* eslint-disable prefer-arrow-callback */
/* eslint-disable valid-jsdoc */

/**
 * Module dependencies.
 */
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

require('dotenv').config({ path: '.env' });

const User = mongoose.model('User');
const Game = mongoose.model('Game');

const nodemailer = require('nodemailer');

/**
 * Auth callback
 */
exports.authCallback = function (req, res, next) {
  res.redirect('/chooseavatars');
};

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
 * Check avatar - Confirm if the user who logged in via passport
 * already has an avatar. If they don't have one, redirect them
 * to our Choose an Avatar page.
 */
exports.checkAvatar = (req, res) => {
  if (req.user && req.user._id) {
    User.findOne({
      _id: req.user._id
    }).exec(function (err, user) {
      if (user.avatar !== undefined) {
        res.redirect('/#!/');
      } else {
        res.redirect('/#!/choose-avatar');
      }
    });
  } else {
    // If user doesn't even exist, redirect to /
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
  const token = jwt.sign({ user: req.user }, process.env.SECRET, {
    expiresIn: 86400
  });
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
      username: newUser.username,
      email: newUser.email
    };
    const token = jwt.sign({ user }, process.env.SECRET);
    res.status(201).json({
      message: 'Success',
      user: {
        _id: newUser._id, // eslint-disable-line no-underscore-dangle
        username: newUser.username,
        email: newUser.email,
        imageUrl: newUser.imageUrl
      },
      token
    });
  });
};


exports.checkEmail = (req, res, next) => {
  const { email } = req.body;
  User.findOne({
    email: req.body.email
  })
    .then((existingEmail) => {
      if (existingEmail) {
        res.status(409).json({
          error: 'A user with that email already exist',
          existingEmail
        });
        return;
      }
      next();
    })
    .catch(error =>
      res.status(400).json({
        message: 'An error occoured',
        error
      }));
};

exports.checkUsername = (req, res, next) => {
  const { username } = req.body;
  User.findOne({
    username: req.body.username
  })
    .then((existingUsername) => {
      if (existingUsername) {
        res.status(409).json({
          error: 'A user with that Username already exist',
          existingUsername
        });
      } else {
        res.status(200).json({
          message: 'You are Good to Go!!!'
        });
      }
    })
    .catch(error =>
      res.status(400).json({
        message: 'An error occoured',
        error
      }));
};


/**
 * Assign avatar to user
 */
exports.avatars = function (req, res) {
  // Update the current user's profile to include the avatar choice they've made
  if (
    req.user &&
    req.user._id &&
    req.body.avatar !== undefined &&
    /\d/.test(req.body.avatar) &&
    avatars[req.body.avatar] // eslint-disable-line
  ) {
    // eslint-disable-line
    User.findOne({
      _id: req.user._id
    }).exec((err, user) => {
      user.avatar = avatars[req.body.avatar]; // eslint-disable-line
      user.save();
    });
  }
  return res.redirect('/#!/app');
};

exports.addDonation = function (req, res) {
  if (req.body && req.user && req.user._id) {
    //eslint-disable-line
    // Verify that the object contains crowdrise data
    if (
      req.body.amount &&
      req.body.crowdrise_donation_id &&
      req.body.donor_name
    ) {
      User.findOne({
        _id: req.user._id //eslint-disable-line
      }).exec((err, user) => {
        // Confirm that this object hasn't already been entered
        let duplicate = false;
        for (let i = 0; i < user.donations.length; i += 1) {
          //eslint-disable-line
          if (
            user.donations[i].crowdrise_donation_id ===
            req.body.crowdrise_donation_id
          ) {
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
  User.findOne({
    _id: id
  }).exec((err, user) => {
    if (err) return next(err);
    if (!user) return next(new Error(`Failed to load User ${id}`));
    req.profile = user;
    next();
  });
};

/**
 * find userby email
 */

exports.searchUser = function (req, res, next) {
  const regexp = /^[A-Za-z0-9._-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,6}$/;
  if (regexp.test(req.body.email)) {
    User.findOne({
      email: req.body.email
    }).exec((err, user) => {
      if (err) return next(err);
      if (!user) return res.json({ message: 'Email not found' });
      return res.json({ message: 'User successfully found', user });
    });
  } else {
    return res.json({ message: 'Invalid email' });
  }
};

/**
 * Send mail to invite user
 */

exports.invitePlayersByMail = function (req, res) {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.USER_MAIL,
      pass: process.env.USER_PSWD
    }
  });
  const mailOptions = {
    from: process.env.USER_MAIL,
    to: req.body.email,
    subject: 'Please join the game',
    text: `Hello, please I would like to invite you to join this game, 
      please click the link below to join \n ${req.body.link}`
  };
  // Send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).send(error);
    }
    return res.status(200).json({
      message: 'Invite Successfully Sent',
      id: info.messageId
    });
  });
};

/** Gathers User Info and Games Logs */
exports.game = function (req, res) {
  const { username } = req.params;
  Game.find().exec((err, games) => {
    if (err) {
      res.status(400).json({ message: 'An error occured' });
    }
    if (!games) return new Error('Failed to load Game');
    const userGameDetails = games
      .map(value => ({
        gameId: value.gameID,
        playedAt: value.playedAt,
        userGame: value.players
          .map(user => ({
            username: user.username,
            points: user.points
          }))
          .filter(user => user.username === username)
      }))
      .filter(user => user.userGame.length > 0);
    const pointsWon = userGameDetails
      .reduce((list, point) => list.concat(point.userGame[0]), [])
      .reduce((points, point) => points + point.points, 0);

    if (userGameDetails.length === 0) {
      return res.status(200).json({
        message: 'You have not played a game',
        code: 200
      });
    }
    return res
      .status(200)
      .json({ games: userGameDetails, point: pointsWon, code: 200 });
  });
};
