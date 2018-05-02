/**
 * Module dependencies.
 */
import mongoose from 'mongoose';
// import should from 'should';
import request from 'supertest';
import chai from 'chai';
import nock from 'nock';
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
    const githubContent = {
      login: 'Orlayhemmy',
      id: 33638254,
      avatar_url: 'https://avatars0.githubusercontent.com/u/33638254?v=4',
      gravatar_id: '',
      url: 'https://api.github.com/users/Orlayhemmy',
      html_url: 'https://github.com/Orlayhemmy',
      followers_url: 'https://api.github.com/users/Orlayhemmy/followers',
      following_url:
        'https://api.github.com/users/Orlayhemmy/following{/other_user}',
      gists_url: 'https://api.github.com/users/Orlayhemmy/gists{/gist_id}',
      starred_url:
        'https://api.github.com/users/Orlayhemmy/starred{/owner}{/repo}',
      subscriptions_url:
        'https://api.github.com/users/Orlayhemmy/subscriptions',
      organizations_url: 'https://api.github.com/users/Orlayhemmy/orgs',
      repos_url: 'https://api.github.com/users/Orlayhemmy/repos',
      events_url: 'https://api.github.com/users/Orlayhemmy/events{/privacy}',
      received_events_url:
        'https://api.github.com/users/Orlayhemmy/received_events',
      type: 'User',
      site_admin: false,
      name: null,
      company: null,
      blog: '',
      location: null,
      email: null,
      hireable: null,
      bio: null,
      public_repos: 10,
      public_gists: 0,
      followers: 1,
      following: 0,
      created_at: '2017-11-13T20:11:32Z',
      updated_at: '2018-05-02T10:27:58Z'
    };
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
    const twitterContent = {
      "id": 2244994945,
      "id_str": "2244994945",
      "name": "Twitter Dev",
      "screen_name": "TwitterDev",
      "location": "Internet",
      "profile_location": null,
      "description": "Your official source for Twitter Platform news, updates & events. Need technical help? Visit https://t.co/mGHnxZU8c1 ⌨️ #TapIntoTwitter",
      "url": "https://t.co/FGl7VOULyL",
      "created_at": '2017-11-13T20:11:32Z',
      "updated_at": '2018-05-02T10:27:58Z'
    };
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
    const googleContent ={
      "kind": "directory#user",
      "id": "the unique user id",
      "primaryEmail": "liz@example.com",
      "name": {
       "givenName": "Liz",
       "familyName": "Smith",
       "fullName": "Liz Smith"
      },
      "isAdmin": true,
      "isDelegatedAdmin": false,
      "lastLoginTime": "2013-02-05T10:30:03.325Z",
      "creationTime": "2010-04-05T17:30:04.325Z",
      "agreedToTerms": true,
      "suspended": false,
      "changePasswordAtNextLogin": false,
      "ipWhitelisted": false,
      "ims": [
       {
        "type": "work",
        "protocol": "gtalk",
        "im": "lizim@talk.example.com",
        "primary": true
       }
      ]
    };
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
