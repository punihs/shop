const request = require('supertest');
const app = require('./../../app');

describe('GET /api/customers', () => {
  it('will create customer', (done) => {
    request(app)
      .post('/api/customers')
      .send({
        name: 'Manjesh V',
        email: 'manjeshpv+1002@gmail.com',
        password: 'Password123',
        locker: 'M123',
        group_id: 2,
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('GET /api/customers', () => {
  it('will create customer', (done) => {
    request(app)
      .post('/api/customers')
      .send({
        name: 'Saneel E S',
        email: 'saneel@shoppre.com',
        password: 'Password123',
        group_id: 1,
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});
