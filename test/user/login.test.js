/* eslint-disable no-shadow */
import supertest from 'supertest';
import { expect } from 'chai';
import mongoose from 'mongoose';
import app from '../../server';


const User = mongoose.model('User');
const request = supertest(app);
const userDetails = {
  email: `tester${Math.random()}@tester.com`,
  password: 'password'
};

describe('/api/auth/login', (done) => { //eslint-disable-line
  beforeEach((done) => {
    const user = new User({
      name: 'Full name',
      email: userDetails.email,
      password: userDetails.password
    });

    user.save((err) => {
      if (err) {
        throw err;
      }
      done();
    });
  });

  it('Should return 200 on successful login', (done) => {
    request.post('/api/auth/login')
      .send(userDetails)
      .end((err, res) => {
        expect(res.status).to.equal(200);
        expect(res.body.status).to.equal('success');
        expect(res.body.message).to.equal('Login Successful');
        expect(res.body.data).to.have.property('user');
        expect(res.body.data).to.have.property('token');
        done();
      });
  });

  it('should return 401 on failed login', (done) => {
    request.post('/api/auth/login')
      .send({
        email: 'wronggemail@wrong.com',
        password: 'wrongpassword'
      })
      .end((err, res) => {
        expect(res.status).to.equal(401);
        expect(res.body.status).to.equal('error');
        expect(res.body.data.token).to.equal('');
        done();
      });
  });

  it('Login should fail for empty details', (done) => {
    request.post('/api/auth/login')
      .send({})
      .end((err, res) => {
        expect(res.status).to.equal(401);
        expect(res.body.status).to.equal('error');
        expect(res.body.data.token).to.equal('');
        done();
      });
  });
});
