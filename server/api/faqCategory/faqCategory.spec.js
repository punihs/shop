const request = require('supertest');
const app = require('./../../app');
const auth = require('../../../logs/credentials');

describe('GET return faqs', () => {
  it('return faqs', (done) => {
    request(app)
      .get('/api/faqs')
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});
