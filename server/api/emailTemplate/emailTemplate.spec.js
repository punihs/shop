const request = require('supertest');
const app = require('./../../app');

const { log } = console;
const vikasAuth = require('../../../logs/vikas-credentials');

describe('EmailTemplate', () => {
  it('return emailTemplates for Hire user', (done) => {
    request(app)
      .get('/api/emailTemplates')
      .set('Authorization', `Bearer ${vikasAuth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        log('EmailTemplate', res.body);
        done();
      });
  });
});
