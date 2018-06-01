const request = require('supertest');
const app = require('../../app');

describe('GET /api/categories', () => {
  it('return categories', (done) => {
    request(app)
      .get('/api/categories')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});
