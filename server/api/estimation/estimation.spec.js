const request = require('supertest');
const app = require('./../../app');

describe('GET return estimations', () => {
  it('return estimations', (done) => {
    request(app)
      .get('/api/estimations')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});
