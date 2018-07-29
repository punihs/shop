const request = require('supertest');
const app = require('./../../app');

describe('GET /api/storeCategory', () => {
  it('return /api/storeCategory ', (done) => {
    request(app)
      .get('/api/storecategory')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('GET /api/storeCategory/show', () => {
  it('return /api/storeCategory/show ', (done) => {
    request(app)
      .get('/api/storecategory/show')
      .send({ cat: 4 })
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

