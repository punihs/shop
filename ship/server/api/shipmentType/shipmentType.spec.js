const request = require('supertest');
const app = require('./../../app');
const auth = require('../../../logs/credentials');


describe('GET /api/shipmentTypes', () => {
  it('return shipmentTypes', (done) => {
    request(app)
      .get('/api/shipmentTypes')
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});
