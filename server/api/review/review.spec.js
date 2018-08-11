const request = require('supertest');
const app = require('../../app');
const opsAuth = require('../../../logs/ops-credentials');

describe('GET /api/reviews', () => {
  it('return reviews', (done) => {
    request(app)
      .get('/api/reviews')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});
describe('POST /api/reviews', () => {
  it('insert the reviews records', (done) => {
    request(app)
      .post('/api/reviews')
      .send({
        name: 'Varun',
        description: 'Good',
        rating: '5',
        country_id: '226',
      })
      .set('Authorization', `Bearer ${opsAuth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(201)
      .then(() => {
        done();
      });
  });
});
