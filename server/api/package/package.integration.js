const request = require('supertest');
const app = require('./../../app');
const auth = require('../../../logs/credentials');
const opsAuth = require('../../../logs/ops-credentials');

const {
  CONTENT_TYPES: { REGULAR },
} = require('../../config/constants');

const abhinavAuth = auth;
const saneelAuth = opsAuth;

describe('POST /api/packages', () => {
  it('save packages', (done) => {
    request(app)
      .post('/api/packages')
      .send({
        type: 1,
        customer_id: 646,
        store_id: 1,
        invoice_code: 'FLIP123',
        weight: 1,
        price_amount: 100,
        content_type: REGULAR,
      })
      .set('Authorization', `Bearer ${saneelAuth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(201)
      .then(() => {
        done();
      });
  });
});

describe('member GET /api/packages', () => {
  it('return packages', (done) => {
    request(app)
      .get('/api/packages')
      .query({
        status: 'READY_TO_SEND',
      })
      .set('Authorization', `Bearer ${abhinavAuth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});
