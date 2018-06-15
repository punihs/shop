const request = require('supertest');
const app = require('./../../app');
const auth = require('../../../logs/credentials');
const opsAuth = require('../../../logs/ops-credentials');
const wwwAuth = require('../../../logs/www-credentials');

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
      .get('/api/packages')
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
        number_of_items: 1,
        price_amount: 100,
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
        type: 1,
        number_of_items: '2',
        price_amount: '2000',
        weight: '2',
        is_item_damaged: '1',
        is_liquid: false,
        is_featured_seller: '1',
        recieved_at: '2018-05-24',
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
