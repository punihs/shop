const request = require('supertest');
const app = require('./../../app');

const { log } = console;

describe('EmailTemplate', () => {
  it('return emailTemplates for Ops user', (done) => {
    request(app)
      .get('/api/emailTemplates?user_id=738')
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        log('EmailTemplate', res.body);
        done();
      });
  });
});
