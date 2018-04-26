/**
 * Module dependencies.
 */
var mongoose = require('mongoose'), //eslint-disable-line
  Schema = mongoose.Schema, // eslint-disable-line
  bcrypt = require('bcryptjs'),
  _ = require('underscore'), // eslint-disable-line
  authTypes = ['github', 'twitter', 'facebook', 'google'];


/**
 * User Schema
 */
var UserSchema = new Schema({ //eslint-disable-line
  name: String,
  email: String,
  username: String,
  provider: String,
  premium: Number, // null or 0 for non-donors, 1 for everyone else (for now)
  donations: [],
  hashed_password: String, // eslint-disable-line
  facebook: {},
  twitter: {},
  github: {},
  google: {}
});

/**
 * Virtuals
 */
UserSchema.virtual('password').set(function (password) {
  this._password = password; //eslint-disable-line
  this.hashed_password = this.encryptPassword(password);
}).get(function () {
  return this._password; //eslint-disable-line
});


var validatePresenceOf = function(value) { //eslint-disable-line
  return value && value.length;
};

// the below 4 validations only apply if you are signing up traditionally
UserSchema.path('name').validate(function (name) {
  // if you are authenticating by any of the oauth strategies, don't validate
  if (authTypes.indexOf(this.provider) !== -1) return true;
  return name.length;
}, 'Name cannot be blank');

UserSchema.path('email').validate(function (email) {
  // if you are authenticating by any of the oauth strategies, don't validate
  if (authTypes.indexOf(this.provider) !== -1) return true;
  return email.length;
}, 'Email cannot be blank');

UserSchema.path('username').validate(function (username) {
  // if you are authenticating by any of the oauth strategies, don't validate
  if (authTypes.indexOf(this.provider) !== -1) return true;
  return username.length;
}, 'Username cannot be blank');

UserSchema.path('hashed_password').validate(function (hashed_password) { //eslint-disable-line
  // if you are authenticating by any of the oauth strategies, don't validate
  if (authTypes.indexOf(this.provider) !== -1) return true;
  return hashed_password.length;
}, 'Password cannot be blank');


/**
 * Pre-save hook
 */
UserSchema.pre('save', function (next) {
  if (!this.isNew) return next();

  if (!validatePresenceOf(this.password) && authTypes.indexOf(this.provider) === -1) // eslint-disable-line
    next(new Error('Invalid password'));
  else {
    next();
  }
});

/**
 * Methods
 */
UserSchema.methods = {
  authenticate: function(plainText) { // eslint-disable-line
    if (!plainText || !this.hashed_password) {
      return false;
    }
    return bcrypt.compareSync(plainText, this.hashed_password);
  },

  encryptPassword: function(password) { // eslint-disable-line
    if (!password) return '';
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
  }
};

mongoose.model('User', UserSchema);
