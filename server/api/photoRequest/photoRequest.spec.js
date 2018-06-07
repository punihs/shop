const request = require('supertest');
const app = require('./../../app');
const auth = require('../../../logs/credentials');

describe('PUT /api/photoRequest', () => {
  it('PUT photoRequest', (done) => {
    request(app)
      .put('/api/photoRequest')
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
