const request = require('supertest');
const app = require('./../../app');
const auth = require('../../../credentials');
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
        type: 'doc',
        seller: 'Amazon',
        reference: 'AMZ123',
        locker: 'M123',
        weight: 1,
        number_of_items: 1,
        price: 100,
      })
      .set('Authorization', `Bearer ${opsAuth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(201)
      .then(() => {
        done();
      });
  });
});
