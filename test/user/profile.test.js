import request from 'supertest';
import app from '../../server';
import chai from 'chai';

const { expect } = chai;
let userToken;

describe('GET /api/profile/:username', () => {

  const user = {
    email: `user${Math.random()}@yahoo.com`,
    username: 'Amarachi',
    password: 'password',
    imageUr: 'https://www.mmm.png',
  };

  const design = {
    preset: 2,
  }
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
      .get('/api/profile/Amarachi')
      .set('card-game-token', `${userToken}`)
      .expect(200)
      .end((req, res) => {
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
        .get('/api/profile/myuser')
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

  it(
    'should change the design of card selected by user',
    (done) => {
      request(app)
        .put('/api/designPicked')
        .send(design)
        .set('card-game-token', userToken)
        .expect(200)
        .end((req, res) => {
          expect(res.body).to.have.property('message');
          expect(res.body.message).to.deep.equal('Your game card has been successfully changed to Aladdin');
          expect(res.body).to.have.property('foundUser');
          expect(res.body.foundUser).to.have.property('presetId');
          done();
        });
    }
  );

  it(
    'should change the design of card selected by user',
    (done) => {
      request(app)
        .get('/api/checkDonations')
        .set('card-game-token', userToken)
        .expect(200)
        .end((req, res) => {
          expect(res.body).to.have.property('amountInvested');
          expect(res.body).to.have.property('message');
          expect(res.body.message).to.deep.equal('Ok');
          done();
        });
    }
  );
});
