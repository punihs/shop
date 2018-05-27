const app = require('./../../app');
const auth = require('../../../logs/credentials');
const opsAuth = require('../../../logs/ops-credentials');
const request = require('supertest');

describe('GET /api/packageMeta/:id', () => {
  it('get packageMeta 12', (done) => {
    request(app)
      .get('/api/packageMeta/1/')
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('PUT /api/packageMeta update meta', () => {
  it('PUT packageItem', (done) => {
    request(app)
      .put('/api/packageMeta/1/')
      .send({
        storage_amount: 100,
        wrong_address_amount: 0.00,
        special_handlig_amount: 0.00,
        charge_amount: 0.00,
        scan_doc_amount: 0.00,
        basic_photo: 10.00,
        pickup_amount: 0.00,
        basic_photo_amount: 0.00,
        split_charge_amount: 0.00,
        standard_photo_amount: 1600,
      })
      .set('Authorization', `Bearer ${opsAuth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

