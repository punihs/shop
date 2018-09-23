const request = require('supertest');
const app = require('./../../../lambda/app');
const { signup } = require('./user.sample');

describe('POST /api/users/notifications', () => {
  it('send emails', (done) => {
    request(app)
      .post('/api/users/notifications')
      .send({
        object: 'user',
        event: 'signup',
        ...signup,
      })
      .expect(200)
      .then(() => {
        done();
      });
  });
});
