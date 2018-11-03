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

describe('GET /api/places?type=indian_states', () => {
  it('return /api/places?type=indian_states', (done) => {
    request(app)
      .get('/api/places?type=indian_states')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('GET /api/places?type=destination_cities', () => {
  it('return /api/places?type=destination_cities', (done) => {
    request(app)
      .get('/api/places?type=destination_cities')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});
