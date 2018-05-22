const request = require('supertest');
const app = require('./../../app');
const auth = require('../../../logs/credentials');

describe('GET /api/shipments', () => {
  it('return 400 on no packages for shipments', (done) => {
    request(app)
      .get('/api/shipments')
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('GET /api/shipments/1/packages', () => {
  it('return packages', (done) => {
    request(app)
      .get('/api/shipments/1/packages')
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

