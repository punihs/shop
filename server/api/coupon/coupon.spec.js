const request = require('supertest');
const app = require('./../../app');
const opsAuth = require('../../../logs/ops-credentials');

describe('GET /api/coupons', () => {
  it('return coupons', (done) => {
    request(app)
      .get('/api/coupons')
      .set('Authorization', `Bearer ${opsAuth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });

  it('POST coupons', (done) => {
    request(app)
      .post('/api/coupons')
      .send({
        name: 'Ramdan',
        code: 'RMN10',
        cashback_percentage: '10',
        discount_percentage: '0',
        max_cashback_amount: '100',
        expires_at: '2018-05-31',
        slug: 'ramdan',
      })
      .set('Authorization', `Bearer ${opsAuth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(201)
      .then(() => {
        done();
      });
  });
  it('PUT coupons', (done) => {
    request(app)
      .put('/api/coupons')
      .send({
        name: 'Ramzan',
        code: 'RMN10',
        cashback_percentage: '0.00',
        discount_percentage: 10,
        max_cashback_amount: 1000,
        expires_at: '2018-06-05',
        display_in_home_page: false,
      })
      .set('Authorization', `Bearer ${opsAuth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(201)
      .then(() => {
        done();
      });
  });
});
