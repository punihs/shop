const request = require('supertest');
const app = require('./../../app');
const auth = require('../../../logs/credentials');

describe('GET /api/shippingPreference/1', () => {
  it('return shippingPreference/1', (done) => {
    request(app)
      .get('/api/shippingPreference/1')
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('put /api/shippingPreference update meta', () => {
  it('update shippingPreference', (done) => {
    request(app)
      .put('/api/shippingPreference/1')
      .send({
        standard_photo: 1,
        scan_doc: 1,
        extra_packing: 1,
        max_weight: 1,
        tax_id: 321321,
      })
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});
