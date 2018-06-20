const request = require('supertest');
const app = require('./../../app');
const auth = require('../../../logs/credentials');

describe('PUT /api/standardPhotoRequest', () => {
  it('PUT standardPhotoRequest', (done) => {
    request(app)
      .put('/api/photoRequest/2/standardPhotoRequest')
      .send({
        packageId: 2,
      })
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(201)
      .then(() => {
        done();
      });
  });
});
describe('PUT /api/advancePhotoRequest', () => {
  it('PUT advancePhotoRequest', (done) => {
    request(app)
      .put('/api/photoRequest/2/advancePhotoRequest')
      .send({
        packageId: 2,
      })
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(201)
      .then(() => {
        done();
      });
  });
});
