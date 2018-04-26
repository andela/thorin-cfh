/**
 * Module dependencies.
 */
import mongoose from 'mongoose';
// import should from 'should';
import request from 'supertest';
import chai from 'chai';
import app from '../../server';

require('dotenv').config({ path: '.env' });

const { expect } = chai;

const User = mongoose.model('User');

const userToken = {};

const userData = {
  username: 'toyboy',
  email: 'toy@dummy.com',
  password: 'toyiscool',
  imageUr: 'http://toy.picture.gif',
  publicId: 'toyiskind'
};

const userData2 = {
  username: 'toyboy',
  email: 'toysss@dummy.com',
  password: 'toyiscool',
  imageUr: 'http://toy.picture.gif',
  publicId: 'toyiskind'
};

// The tests
describe('sign up users with token', () => {
  beforeEach((done) => {
    /**
   * login in exisiting user to t=and return a token
   *
   * @param {Object} req HTTP request object
   * @param {Object} res HTTP response object
   *
   * @returns {void}
   */
    function clearDB() {
      const promises = [
        User.remove().exec(),
      ];

      Promise.all(promises)
        .then(() => {
          done();
        });
    }

    if (mongoose.connection.readyState === 0) {
      mongoose.connect(process.env.MONGOHQ_URL, (err) => {
        if (err) {
          throw err;
        }
        return clearDB();
      });
    } else {
      return clearDB();
    }
  });


  it('throw error if form is empty', (done) => {
    request(app)
      .post('/api/auth/signup')
      .expect(400)
      .end((err, res) => {
        userData.user = res.body.user;
        expect(res.body.message).to.include('Signup Errors');
        if (err) return done(err);
        done();
      });
  });

  it('creates a new user', (done) => {
    request(app)
      .post('/api/auth/signup')
      .set('Content-Type', 'application/json')
      .send(userData)
      .expect(201)
      .end((err, res) => {
        userData.user = res.body.user;
        userToken.token = res.body.token;
        expect(res.body.user.username).to.include(userData.username);
        if (err) return done(err);
        done();
      });
  });

  it('it should genetate a token on successful', (done) => {
    request(app)
      .post('/api/auth/signup')
      .set('Content-Type', 'application/json')
      .send(userData)
      .expect(201)
      .end((err, res) => {
        userData2.user = res.body.token;
        expect(res.body.token).to.equal(userData2.user);
        if (err) return done(err);
        done();
      });
  });

  it(
    'trow error if email is already in dababse when new user signs up',
    (done) => {
      request(app)
        .post('/api/auth/signup')
        .set('Content-Type', 'application/json')
        .send(userData)
        .expect(201)
        .end((err, res) => {
          console.log('I AM HERE!!!!!!!', res.body);
          userData.user = res.body.message;
          expect(res.body.message).to.equal('A user with that email already exist');
          if (err) return done(err);
          done();
        });
    }
  );
});

