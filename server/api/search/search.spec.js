const request = require('supertest');
const app = require('./../../app');
const opsAuth = require('../../../logs/ops-credentials');

describe('Search', () => {
  it('search customer', (done) => {
    request(app)
      .get('/api/search')
      .query({
        type: 'User',
        q: 'vikas',
      })
      .set('Authorization', `Bearer ${opsAuth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });

  it('search store', (done) => {
    request(app)
      .get('/api/search')
      .query({
        type: 'Store',
        q: 'Amazon',
      })
      .set('Authorization', `Bearer ${opsAuth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});
