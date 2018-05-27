const request = require('supertest');
const app = require('./../../app');
const auth = require('../../../logs/credentials');
const opsAuth = require('../../../logs/ops-credentials');

describe('GET /api/users', () => {
  it('return users', (done) => {
    request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});


describe(' POST /api/users', () => {
  it('will create user', (done) => {
    request(app)
      .post('/api/users')
      .send({
        name: 'Saneel E S',
        email: 'saneel@shoppre.com',
        password: 'Password123',
        group_id: 1,
      })
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('GET /api/users/1', () => {
  it('will fetch user', (done) => {
    request(app)
      .get('/api/users/1')
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('PUT /api/users/1/unread', () => {
  it('will unread user', (done) => {
    request(app)
      .put('/api/users/1/unread')
      .set('Authorization', `Bearer ${opsAuth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('delete /api/users/1', () => {
  it('will destroy the user', (done) => {
    request(app)
      .delete('/api/users/1')
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

