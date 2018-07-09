const request = require('supertest');
const app = require('../../../app');
const opsAuth = require('../../../../logs/ops-credentials');

describe('member GET /api/packages/1/followers', () => {
  it('return packages/1/followers', (done) => {
    request(app)
      .get('/api/packages/1/followers')
      .set('Authorization', `Bearer ${opsAuth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});
