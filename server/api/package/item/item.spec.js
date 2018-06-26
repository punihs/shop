const request = require('supertest');
const app = require('../../../app');
const auth = require('../../../../logs/credentials');
const opsAuth = require('../../../../logs/ops-credentials');

describe('member GET /api/packages/1/items', () => {
  it('return packages/1/items', (done) => {
    request(app)
      .get('/api/packages/1/items')
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('ops GET /api/packages/1/items', () => {
  it('return packages/1/items', (done) => {
    request(app)
      .get('/api/packages/1/items')
      .set('Authorization', `Bearer ${opsAuth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

