const request = require('supertest');
const app = require('./../../app');

describe('GET /api/places', () => {
  it('return /api/places ', (done) => {
    request(app)
      .get('/api/places')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('GET /api/places/1', () => {
  it('return /api/places/1 ', (done) => {
    request(app)
      .get('/api/places/1')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});
