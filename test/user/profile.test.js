import request from 'supertest';
import chai from 'chai';
import db from '../user/profile.json';
import app from '../../server';

const { expect } = chai;
let userToken;

const result = (username) => {
  const userGameDetails = db.map(value => ({
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
    return {
      message: 'You have not played a game',
      code: 200
    };
  }
  return { games: userGameDetails, point: pointsWon, code: 200 };
};


describe('GET /api/profile/:username', () => {
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

  it('should return the user info and personal game logs', (done) => {
    request(app)
      .get('/api/profile/foye')
      .set('card-game-token', userToken)
      .expect(200)
      .end((req, res) => {
        expect(res.body).to.have.property('games');
        expect(res.body).to.have.property('code');
        expect(res.body).to.have.property('point');
        expect(res.status).to.equal(200);
        done();
      });
  });

  it(
    'should return empty array for players who has not played a game',
    (done) => {
      request(app)
        .get('/api/profile/my_user')
        .set('card-game-token', userToken)
        .expect(200)
        .end((req, res) => {
          expect(res.body).to.have.property('code');
          expect(res.body).to.have.property('message');
          expect(res.status).to.equal(200);
          expect(res.body)
            .to.have.property('message')
            .to.equal('You have not played a game');

          done();
        });
    }
  );
});
