import { expect } from 'chai';
import supertest from 'supertest';
import app from '../../server';


const request = supertest;
let userToken;

describe('/api/donations', () => {
    const user = {
        email: `mmmeem${Math.random()}@test.com`,
        username: 'my_user1',
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

    it('should not return donations if the user is not authenticated', (done) => {
        request(app)
            .get('/api/donations')
            .end((err, res) => {
                expect(res.statusCode).to.equal(403);
                expect(res.body.message).to.deep.equal('You need to sign up or login');
                done();
            });
    });

    it('should return donations if user is authenticated with a token', (done) => {
        request(app)
            .get('/api/donations')
            .set('card-game-token', userToken)
            .end((err, res) => {
                expect(res.statusCode).to.equal(200);
                expect(res.body.message).to.deep.equal('Donations successfully retrieved');
                done();
            });
    });

    it('should display a specified page if requested', (done) => {
        request(app)
            .get('/api/donations?page=1')
            .set('card-game-token', userToken)
            .end((err, res) => {
                expect(res.statusCode).to.equal(200);
                expect(res.body.message).to.deep.equal('Donations successfully retrieved');
                expect(res.body.pagination.page).to.equal('1');
                if (err) console.log(err.message);
                done();
            });
    });
});

