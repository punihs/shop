const request = require('supertest');
const app = require('./../app');
const auth = require('../../logs/credentials');

describe('schedule Cron Job', () => {
  it('runs cron', (done) => {
    request(app)
      .get('/api/crons/')
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

