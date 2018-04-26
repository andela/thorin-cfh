/* eslint-disable import/prefer-default-export */
import mongoose from 'mongoose';

const User = mongoose.model('User');

export const validateSignIn = (req, res, next) => {
  User.findOne({
    email: req.body.email
  }, (err, user) => {
    if (err) {
      return done(err); // eslint-disable-line
    }
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Login failed. Invalid email.',
        data: {
          token: '',
          authenticated: false,
          user: null
        }
      });
    }
    if (!user.authenticate(req.body.password)) {
      return res.status(401).json({
        status: 'error',
        message: 'Login failed. Invalid password.',
        data: {
          token: '',
          authenticated: false,
          user: null
        }
      });
    }
    return next();
  });
};
