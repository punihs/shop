const request = require('supertest');
const app = require('../../app');
const auth = require('../../../logs/credentials');
const opsAuth = require('../../../logs/ops-credentials');

describe('POST /api/transactions', () => {
  it('save transactions', (done) => {
    request(app)
      .post('/api/transactions')
      .send({
        customer_id: 2,
        amount: 1000,
        description: 'New transection happen',
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

describe('DELETE /api/transactions', () => {
  it('delete transactions', (done) => {
    request(app)
      .delete('/api/transactions/1')
      .set('Authorization', `Bearer ${opsAuth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});
