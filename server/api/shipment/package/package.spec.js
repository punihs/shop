const request = require('supertest');
const app = require('../../../app');
const auth = require('../../../../logs/credentials');

describe('GET /api/shipments/1/packages', () => {
  it('return packages', (done) => {
    request(app)
      .get('/api/shipments/1/packages')
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});
