const request = require('supertest');
const app = require('./../../app');
const auth = require('../../../logs/credentials');
const opsAuth = require('../../../logs/ops-credentials');

describe('GET /api/packages', () => {
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


describe('POST /api/packages', () => {
  it('save packages', (done) => {
    request(app)
      .post('/api/packages')
      .send({
        type: 'Nondoc',
        store_id: 1,
        reference_code: 'FLIP123',
        locker_code: 'SHPR91-685',
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
        type: 'nondoc',
        locker_code: 'SHPR91-685',
        number_of_items: '2',
        price: '2000',
        weight: '2',
        is_item_damaged: '1',
        liquid: '1',
        is_featured_seller: '1',
        received: '2018-05-24',
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
