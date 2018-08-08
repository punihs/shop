const request = require('supertest');
const app = require('../../app');
const auth = require('../../../logs/credentials');

describe('get /api/redemptions/apply', () => {
  it('will apply promo code', (done) => {
    request(app)
      .put('/api/redemptions/apply?order_code=1000&coupon_code=RMN10')
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

