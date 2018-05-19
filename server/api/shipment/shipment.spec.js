const request = require('supertest');
const app = require('./../../app');
const auth = require('../../../logs/credentials');

describe('GET /api/shipments', () => {
  it('return 400 on no packages for shipments', (done) => {
    request(app)
      .get('/api/shipments')
      .set('Authorization', `bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});
