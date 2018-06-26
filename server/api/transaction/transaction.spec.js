const request = require('supertest');
const app = require('../../app');
const { TRANSACTION_TYPES: { CREDIT, DEBIT } } = require('../../config/constants');
const auth = require('../../../logs/credentials');
const opsAuth = require('../../../logs/ops-credentials');

describe('POST /api/transactions', () => {
  it('save transactions', (done) => {
    request(app)
      .post('/api/transactions')
      .send({
        customer_id: 2,
        amount: 1000,
        type: CREDIT,
        description: 'New transaction happen',
      })
      .set('Authorization', `Bearer ${opsAuth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});
describe('POST /api/transactions', () => {
  it('save transactions', (done) => {
    request(app)
      .post('/api/transactions')
      .send({
        customer_id: 2,
        amount: 1000,
        type: DEBIT,
        description: 'New transaction happen',
      })
      .set('Authorization', `Bearer ${opsAuth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});


describe('GET /api/transactions', () => {
  it('return transactions', (done) => {
    request(app)
      .get('/api/transactions')
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});
