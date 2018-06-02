const request = require('supertest');
const app = require('./../../app');


describe('GET /api/paymentGateways', () => {
  it('return paymentGateways', (done) => {
    request(app)
      .get('/api/paymentGateways')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});
