/**
 * Module dependencies.
 */
import mongoose from 'mongoose';

const User = mongoose.model('User');
const avatar = require('./avatars').all();


/**
 * Auth callback
 * @param  {object} req
 * @param  {object} res
 * @param  {object} next
 * @returns {void}
 */
export function authCallback(req, res, next) { // eslint-disable-line
  res.redirect('/#!');
}

/**
 * Show login form
 * @param  {object} req
 * @param  {object} res
 * @returns {void}
 */
export function signin(req, res) {
  if (!req.user) {
    res.redirect('/#!/signin?error=invalid');
  } else {
    res.redirect('/#!/app');
  }
}

/**
 * Show sign up form
 * @param  {object} req
 * @param  {object} res
 * @returns {void}
 */
export function signup(req, res) {
  if (!req.user) {
    res.redirect('/#!/signup');
  } else {
    res.redirect('/#!/app');
  }
}

/**
 * Logout
 * @param  {object} req
 * @param  {object} res
 * @returns {void}
 */
export function signout(req, res) {
  req.logout();
  res.redirect('/');
}

/**
 * Session
 * @param  {object} req
 * @param  {object} res
 * @returns {void}
 */
export function session(req, res) {
  res.redirect('/');
}

/**
 * Check avatar - Confirm if the user who logged in via passport
 * already has an avatar. If they don't have one, redirect them
 * to our Choose an Avatar page.
 * @param  {object} req
 * @param  {object} res
 * @returns {void}
 */
export function checkAvatar(req, res) {
  if (req.user && req.user._id) { // eslint-disable-line
    User.findOne({
      _id: req.user._id // eslint-disable-line
    })
      .exec((err, foundUser) => {
        if (foundUser.avatar !== undefined) {
          res.redirect('/#!/');
        } else {
          res.redirect('/#!/choose-avatar');
        }
      });
  } else {
    // If user doesn't even exist, redirect to /
    res.redirect('/');
  }
}

/**
 * Create user
* @param {object} req
* @param  {object} res
* @returns {void}
*/
export function create(req, res) {
  if (req.body.name && req.body.password && req.body.email) {
    User.findOne({
      email: req.body.email
    }).exec((err, existingUser) => {
      if (!existingUser) {
        const newUser = new User(req.body);
        // Switch the user's avatar index to an actual avatar url
        newUser.avatar = avatar[newUser.avatar];
        newUser.provider = 'local';
        newUser.save((err) => {
          if (err) {
            return res.render('/#!/signup?error=unknown', {
              errors: err.errors,
              newUser
            });
          }
          req.logIn(newUser, (err) => {
            if (err) return next(err); // eslint-disable-line
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
}

/**
 * Assign avatar to user
* @param {object} req
* @param  {object} res
* @returns {void}
*/
export function avatars(req, res) {
  // Update the current user's profile to include the avatar choice they've made
  if (req.user && req.user._id && req.body.avatar !== undefined && // eslint-disable-line
    /\d/.test(req.body.avatar) && avatars[req.body.avatar]) {
    User.findOne({
      _id: req.user._id // eslint-disable-line
    })
      .exec((err, userAvatar) => {
        userAvatar.avatar = avatars[req.body.avatar];
        userAvatar.save();
      });
  }
  return res.redirect('/#!/app');
}

/**
 * add donation
* @param {object} req
* @param  {object} res
* @returns {void}
 */
export function addDonation(req, res) {
  if (req.body && req.user && req.user._id) { // eslint-disable-line
    // Verify that the object contains crowdrise data
    if (req.body.amount && req.body.crowdrise_donation_id && req.body.donor_name) {
      User.findOne({
        _id: req.user._id // eslint-disable-line
      })
        .exec((err, player) => {
        // Confirm that this object hasn't already been entered
          let duplicate = false;
          for (let i = 0; i < player.donations.length; i + 1) {
            if (player.donations[i].crowdrise_donation_id === req.body.crowdrise_donation_id) { // eslint-disable-line
              duplicate = true;
            }
          }
          if (!duplicate) {
            console.log('Validated donation');
            player.donations.push(req.body);
            player.premium = 1;
            player.save();
          }
        });
    }
  }
  res.send();
}

/**
*  Show profile
* @param {object} req
* @param  {object} res
* @returns {object} user
*/
export function show(req, res) {
  const userProfile = req.profile;

  res.render('users/show', {
    title: userProfile.name,
    userProfile
  });
}

/**
 * Send User
* @param {object} req
* @param  {object} res
* @returns {void}
*/
export function me(req, res) {
  res.jsonp(req.user || null);
}

/**
 * Find user by id
* @param {object} req
* @param  {object} res
* @param {object} next
* @param  {object} id
* @returns {void}
*/
export function user(req, res, next, id) {
  User
    .findOne({
      _id: id
    })
    .exec((err, foundUser) => {
      if (err) return next(err);
      if (!foundUser) return next(new Error(`Failed to load User ${id}`));
      req.profile = foundUser;
      next();
    });
}
