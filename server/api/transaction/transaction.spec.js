const request = require('supertest');
const app = require('./../../app');


describe('public: GET /api/transactions', () => {
  it('return wallet amount', (done) => {
    request(app)
      .get('/api/transactions')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('public: GET /api/transactions', () => {
  it('return loyalty points', (done) => {
    request(app)
      .get('/api/transactions/loyalty?customer_id=646')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});


describe('http://localhost:8000/admin/walletUpdate', () => {
  it('http://localhost:8000/admin/walletUpdate', (done) => {
    request(app)
      .put('/api/transactions')
      .send({
        customer_id: 646,
        amount: 200,
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});
