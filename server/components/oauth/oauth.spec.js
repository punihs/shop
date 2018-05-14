const request = require('supertest');

const app = require('./../../app');

describe('GET /api/user/login', () => {
  it('respond with access tokens', (done) => {
    request(app)
      .post('/api/user/login')
      .send({
        username: 'manjeshpv@gmail.com',
        password: 'password',
      })
      .expect('Content-Type', /html/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});
