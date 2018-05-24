import { expect } from 'chai';
import supertest from 'supertest';
import app from '../../server';

const request = supertest;
let userToken;

describe('Games API Endpoint', () => {
  const user = {
    email: `user${Math.random()}@gmail.com`,
    username: 'my_user',
    password: 'Mypassword1',
    imageUr: 'https://www.mmm.png',
  };

  before((done) => {
    request(app)
      .post('/api/auth/signup')
      .send(user)
      .end((err, res) => {
        userToken = res.body.token;
        done();
      });
  });

  describe('/api/games/:gameID/start', () => {
    it('should not save a game if the user is not authenticated', (done) => {
      request(app)
        .post('/api/games/v5gty/start')
        .set('card-game-token', '')
        .send({
          players: [{
            username: 'Amarachi',
            points: 4,
          },
          {
            username: 'Amarachi',
            points: 4,
          }],
          winner: 'Amarachi',
          gameStarter: 'Luke',
          roundsPlayed: 11,
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(403);
          expect(res.body.message).to.deep.equal('You need to sign up or login');
          done();
        });
    });

    it('should save a game if the user is authenticated with a token', (done) => {
      request(app)
        .post('/api/games/v5gty/start')
        .set('card-game-token', userToken)
        .send({
          players: [{
            username: 'Amarachi',
            points: 4,
          },
          {
            username: 'Amarachi',
            points: 4,
          }],
          winner: 'Amarachi',
          gameStarter: 'Luke',
          roundsPlayed: 11,
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(201);
          expect(res.body).to.have.property('msg');
          expect(res.body.msg).to.deep.equal('Success, Game saved');
          done();
        });
    });

    it('should not save a game if some of the fields are missing', (done) => {
      request(app)
        .post('/api/games/v5gty/start')
        .set('card-game-token', userToken)
        .send({
          gameStarter: 'Luke',
          roundsPlayed: 11,
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(400);
          expect(res.body.message).to.deep.equal('Failure, Game not saved');
          expect(res.body.errors).to.deep.include('players must be an array');
          expect(res.body.errors).to.deep.include('winner must be a string');
          done();
        });
    });
  });

  describe('/api/leaderboard', () => {
    it('should not return leaderboard data if the user is not authenticated', (done) => {
      request(app)
        .get('/api/leaderboard')
        .end((err, res) => {
          expect(res.statusCode).to.equal(403);
          expect(res.body.message).to.deep.equal('You need to sign up or login');
          expect(res.body).to.not.have.property('Leaderboard');
          done();
        });
    });

    it('should return leaderboard data if the user is authenticated', (done) => {
      request(app)
        .get('/api/leaderboard')
        .set('card-game-token', userToken)
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.message).to.deep.equal('Leaderboard successfully retrieved');
          expect(res.body.leaderboard).to.not.be.null;
          expect(res.body.leaderboard).to.have.any.keys('Amarachi');
          expect(res.body.leaderboard.Amarachi[0]).to.have.all.keys('gameID', 'winner', 'playedAt');
          done();
        })
    });
  });

  describe('/api/games/history', () => {
    it('should not return games history if the user is not authenticated', (done) => {
      request(app)
        .get('/api/games/history')
        .end((err, res) => {
          expect(res.statusCode).to.equal(403);
          expect(res.body.message).to.deep.equal('You need to sign up or login');
          expect(res.body).to.not.have.property('games');
          done();
        });
    });

    it('should return games history if the user is authenticated', (done) => {
      request(app)
        .get('/api/games/history')
        .set('card-game-token', userToken)
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.message).to.deep.equal('Games have been successfully retrieved');
          expect(res.body.games).to.not.be.null;
          expect(res.body.games[0].game).to.have.any.keys('Players', 'gameID', 'winner', 'roundsPlayed', 'playedAt');
          done();
        })
    });

    it('should return a particular page if requested', (done) => {
      request(app)
        .get('/api/games/history?page=1')
        .set('card-game-token', userToken)
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.message).to.deep.equal('Games have been successfully retrieved');
          expect(res.body.games).to.not.be.null;
          expect(res.body.pagination).to.not.be.null;
          expect(res.body.pagination.page).to.equal('1');
          done();
        })
    });
  });
});
