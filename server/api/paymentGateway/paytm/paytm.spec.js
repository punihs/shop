const request = require('supertest');
const app = require('./../../../app');
const auth = require('../../../../logs/credentials');

describe('get /api/paytm', () => {
  it('return api/paytm', (done) => {
    request(app)
      .get('/api/paytm/')
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('get /api/paytm/response', () => {
  it('return api/paytm/response', (done) => {
    request(app)
      .get('/api/paytm/response')
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});
