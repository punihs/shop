const request = require('supertest');

const app = require('../../../app');
const auth = require('../../../../logs/credentials');
const opsAuth = require('../../../../logs/ops-credentials');

describe('GET /api/packages/:id/meta', () => {
  it('get packageMeta', (done) => {
    request(app)
      .get('/api/packages/1/meta')
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('PUT /api/packages/1/meta update meta', () => {
  it('PUT packageMeta', (done) => {
    request(app)
      .put('/api/packages/1/meta')
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

