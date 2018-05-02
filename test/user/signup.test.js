/**
 * Module dependencies.
 */
import mongoose from 'mongoose';
// import should from 'should';
import request from 'supertest';
import chai from 'chai';
import nock from 'nock';
import app from '../../server';
import { githubContent, twitterContent, googleContent } from './mockResponse';

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

const userData3 = {
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
      const promises = [User.remove().exec()];

      Promise.all(promises).then(() => {
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

  it('throw error if email is already in dababse when new user signs up', (done) => {
    request(app)
      .post('/api/auth/signup')
      .set('Content-Type', 'application/json')
      .send(userData3)
      .expect(201)
      .end((err, res) => {
        expect(res.body.message).to.equal('Success');
        if (err) return done(err);
        done();
      });
  });

  it('returns success when user is authenticated through github', (done) => {
    
    nock('https://api.github.com')
      .get('/users/Orlayhemmy?client_id=f77890a5908bfd148937&client_secret=5b577ca4b7ca3fbc3ca5feea1264eb9caf826674/')
      .reply(200, githubContent);

    request('https://api.github.com')
      .get('/users/Orlayhemmy?client_id=f77890a5908bfd148937&client_secret=5b577ca4b7ca3fbc3ca5feea1264eb9caf826674/')
      .end((err, res) => {
        const response = res.body;
        expect(response.login).to.equal('Orlayhemmy');
        expect(response).to.have.property('email');
        expect(response).to.have.property('avatar_url');
        expect(res.status).to.equal(200);
        done();
      });
  });

  it('returns success when user is authenticated through twitter', (done) => {
    nock('https://api.twitter.com')
      .get('/1.1/users/show.json?screen_name=twitterdev')
      .reply(200, twitterContent);

    request('https://api.twitter.com')
      .get('/1.1/users/show.json?screen_name=twitterdev')
      .end((err, res) => {
        const response = res.body;
        expect(res.body).to.have.property('name');
        expect(response).to.have.property('screen_name');
        expect(response).to.have.property('url');
        expect(res.status).to.equal(200);
        done();
      });
  });

  it('returns success when user is authenticated through google', (done) => {
    nock('https://www.googleapis.com')
      .get('/user/directory/v1/Liz/keys')
      .reply(200, googleContent);

    request('https://www.googleapis.com')
      .get('/user/directory/v1/Liz/keys')
      .end((err, res) => {
        const response = res.body;
        expect(res.body.name).to.have.property('givenName');
        expect(res.body.name).to.have.property('familyName');
        expect(response).to.have.property('primaryEmail');
        expect(res.status).to.equal(200);
        done();
      });
  });
});
