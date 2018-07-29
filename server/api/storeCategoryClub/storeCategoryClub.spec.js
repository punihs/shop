const request = require('supertest');
const app = require('./../../app');

describe('GET /api/stores', () => {
  it('return /api/stores ', (done) => {
    request(app)
      .get('/api/stores')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('GET /api/stores/1', () => {
  it('return /api/stores/1 ', (done) => {
    request(app)
      .get('/api/stores/1')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

