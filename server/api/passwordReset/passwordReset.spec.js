const request = require('supertest');
const app = require('./../../app');
const auth = require('../../../logs/credentials');

describe('Reset POST /api/passwordReset/submitForgot', () => {
  it('will send reset password to cutomer', (done) => {
    request(app)
      .post('/api/passwordReset/submitForgot')
      .send({
        email: 'venkat@gmail.com',
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
        email: 'venkat@gmail.com',
        password: 'Punith8970',
        password_confirmation: 'Punith8970',
      })
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});
