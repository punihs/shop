const request = require('supertest');
const app = require('./../../app');
const auth = require('../../../logs/credentials');
const opsAuth = require('../../../logs/ops-credentials');
const wwwAuth = require('../../../logs/www-credentials');

const {
  CONSIGNMENT_TYPES: { DOC }, CONTENT_TYPES: { REGULAR, SPECIAL },
} = require('../../config/constants');

describe('public GET /api/packages', () => {
  it('return packages', (done) => {
    request(app)
      .get('/api/packages')
      .set('Authorization', `Bearer ${wwwAuth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('member GET /api/packages', () => {
  it('return packages', (done) => {
    request(app)
      .get('/api/packages')
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('ops GET /api/packages', () => {
  it('return packages', (done) => {
    request(app)
      .get('/api/packages?fl=id,name,state_id,state_name&limit=15&offset=0&q=&sid=&sort=-&status=VALUES')
      .set('Authorization', `Bearer ${opsAuth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});


describe('POST /api/packages', () => {
  it('save packages', (done) => {
    request(app)
      .post('/api/packages')
      .send({
        type: 1,
        customer_id: 646,
        store_id: 1,
        reference_code: 'FLIP123',
        weight: 1,
        price_amount: 100,
        content_type: REGULAR,
      })
      .set('Authorization', `Bearer ${opsAuth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(201)
      .then(() => {
        done();
      });
  });
});

describe('POST /api/packages update meta', () => {
  it('update packages', (done) => {
    request(app)
      .put('/api/packages/1')
      .send({
        seller: 'Amazon.in',
        reference_code: '123',
        consignment_type: DOC,
        price_amount: 2000,
        weight: 2,
        content_type: SPECIAL,
        status: 'review',
      })
      .set('Authorization', `Bearer ${opsAuth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('DELETE /api/packages/1', () => {
  it('save packages', (done) => {
    request(app)
      .delete('/api/packages/1')
      .set('Authorization', `Bearer ${opsAuth.access_token}`)
      // .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});
