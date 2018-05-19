const request = require('supertest');

const app = require('../../app');

describe('GET /api/shippingRates', () => {
  it('respond with list of prices', (done) => {
    request(app)
      .get('/api/shippingRates?all=true&country=US&type=doc&weight=0.5')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});
