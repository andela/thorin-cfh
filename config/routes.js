/* eslint-disable func-names */
/* eslint-disable global-require */
import { validateSignIn } from './middlewares/validateSignIn';
import validator from './middlewares/validator';
import auth from './middlewares/checkToken';
import game from '../app/controllers/games';

module.exports = function (app, passport) {
  // User Routes
  const users = require('../app/controllers/users');
  const index = require('../app/controllers/index');

  app.get('/signin', users.signin);
  app.get('/signup', users.signup);
  app.get('/signout', users.signout);

  // Setting up the users api
  app.post('/users', users.create);
  app.post('/api/search/users', users.searchUser);
  app.post('/api/mailer', users.invitePlayersByMail);

  //

  app.post('/api/auth/checkuser', users.checkEmail, users.checkUsername);

  app.post('/api/auth/signup', validator.Signup, users.createUser);
  app.get('/api/profile/:username', auth.verifyToken, users.game);

  // Donation Routes
  app.post('/donations', users.addDonation);

  // Login API endpoint
  app.post('/api/auth/login', validateSignIn, passport.authenticate('local', {
    session: false,
    failWithError: true
  }), users.loginSuccess, users.loginFailure);

  app.post('/users/session', passport.authenticate('local', {
    failureRedirect: '/signin',
    failureFlash: 'Invalid email or password.'
  }), users.session);

  app.get('/users/me', users.me);
  app.get('/users/:userId', users.show);

  // Setting the facebook oauth routes
  app.get('/auth/facebook', passport.authenticate('facebook', {
    scope: ['email'],
    failureRedirect: '/signin'
  }), users.signin);

  app.get('/auth/facebook/callback', passport.authenticate('facebook', {
    failureRedirect: '/signin'
  }), index.render);

  // Setting the twitter oauth routes
  app.get('/auth/twitter', passport.authenticate('twitter', {
    failureRedirect: '/signin'
  }), users.signin);

  app.get('/auth/twitter/callback', passport.authenticate('twitter', {
    failureRedirect: '/signin'
  }), index.render);

  // Setting the google oauth routes
  app.get('/auth/google', passport.authenticate('google', {
    failureRedirect: '/signin',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ]
  }), users.signin);

  app.get('/auth/google/callback', passport.authenticate('google', {
    failureRedirect: '/signin',

  }), index.render);

  // Finish with setting up the userId param
  app.param('userId', users.user);

  // Answer Routes
  const answers = require('../app/controllers/answers');
  app.get('/answers', answers.all);
  app.get('/answers/:answerId', answers.show);
  // Finish with setting up the answerId param
  app.param('answerId', answers.answer);

  // Question Routes
  const questions = require('../app/controllers/questions');
  app.get('/questions', questions.all);
  app.get('/questions/:questionId', questions.show);
  // Finish with setting up the questionId param
  app.param('questionId', questions.question);

  // Home route
  app.get('/play', index.play);
  app.get('/', index.render);

  // Start game API endpoint
  app.post(
    '/api/games/:id/start',
    auth.verifyToken,
    validator.gameValidation,
    game.saveGame,
  );

  app.put('/api/designPicked', auth.verifyToken, users.updateUser);
  app.get('/api/checkDonations', auth.verifyToken, users.checkUserDonation);
  // Game history API endpoint
  app.get('/api/games/history', auth.verifyToken, game.gameHistory);

  // User donations API endpoint
  app.get('/api/donations', auth.verifyToken, users.getDonations);

  // Leaderboard API endpoint
  app.get('/api/leaderboard', auth.verifyToken, game.gameLeaderboard);
};
