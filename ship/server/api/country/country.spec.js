const request = require('supertest');
const app = require('../../app');
const auth = require('../../../logs/credentials');

describe('GET /api/countries', () => {
  it('return countries', (done) => {
    request(app)
      .get('/api/countries')
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('GET /api/countries/afghanistan', () => {
  it('return countries/afghanistan', (done) => {
    request(app)
      .get('/api/countries/afghanistan')
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});
