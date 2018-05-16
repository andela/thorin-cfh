import request from 'supertest';
import chai from 'chai';
import app from '../../server';

const { expect } = chai;

describe('GET /api/profile', () => {
  it('Should return 200 on get profile call', (done) => {
    request(app)
      .get('/api/usergames')
      .expect(200)
      .end((req, res) => {
        expect(res.body).to.have.property('data');
        expect(res.body).to.have.property('code');
        expect(res.status).to.equal(200);
        done();
      });
  });
});
