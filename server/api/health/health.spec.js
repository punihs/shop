const assert = require('assert');
const request = require('supertest');

const app = require('../../app');

describe('Health /api/health', () => {
  it('respond with status', (done) => {
    request(app)
      .post('/api/health')
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        assert(res.body.db, 'db should be true');
        done();
      });
  });
});
