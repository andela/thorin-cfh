import request from 'supertest';
import chai from 'chai';
import app from '../../server';

const { expect } = chai;
let userToken;

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
      .get('/api/profile/money')
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
