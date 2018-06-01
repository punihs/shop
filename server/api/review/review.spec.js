const request = require('supertest');
const app = require('../../app');

describe('GET /api/reviews', () => {
  it('return reviews', (done) => {
    request(app)
      .get('/api/reviews')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});
