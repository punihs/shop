const request = require('supertest');
const assert = require('assert');
const app = require('./../../app');
const auth = require('../../../logs/credentials');

describe('GET /api/ship_requests', () => {
  it('return ship_requests', (done) => {
    request(app)
      .post('/api/ship_requests')
      .set('Authorization', `bearer ${auth.access_token}`)
      .send()
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        assert.equal(63, res.body.length);
        done();
      });
  });
});
