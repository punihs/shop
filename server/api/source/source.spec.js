const request = require('supertest');
const app = require('./../../app');

describe('GET /api/sources', () => {
  it('return /api/sources ', (done) => {
    request(app)
      .get('/api/sources')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('GET /api/sources/1', () => {
  it('return /api/sources/1 ', (done) => {
    request(app)
      .get('/api/sources/1')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

