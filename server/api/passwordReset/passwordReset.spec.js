const request = require('supertest');
const app = require('./../../app');
const auth = require('../../../logs/credentials');

describe('Reset POST /api/passwordReset/submitForgot', () => {
  it('will send reset password to cutomer', (done) => {
    request(app)
      .post('/api/passwordReset/submitForgot')
      .send({
        email: 'tech.shoppre@gmail.com',
      })
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('Reset PUT /api/passwordReset/resetPassword', () => {
  it('will send reset password to cutomer', (done) => {
    request(app)
      .put('/api/passwordReset/resetPassword')
      .send({
        email: 'tech.shoppre@gmail.com',
        password: 'admin1234',
        password_confirmation: 'admin1234',
      })
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});
