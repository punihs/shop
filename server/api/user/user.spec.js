const request = require('supertest');
const assert = require('assert');
const app = require('./../../app');
const { User } = require('./../../conn/sqldb');
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


describe('GET /api/users/:id', () => {
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

describe('GET /api/users/me', () => {
  it('will fetch user', (done) => {
    request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        assert.strictEqual(res.body.id, 2);
        assert.strictEqual(res.body.salutation, 'Mr');
        assert.strictEqual(res.body.first_name, 'Venkat');
        assert.strictEqual(res.body.last_name, 'Customer');
        assert.strictEqual(res.body.email, 'venkat@gmail.com');
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

describe('delete /api/users/:id', () => {
  let userId;

  before((done) => {
    User
      .create({ })
      .then((user) => {
        userId = user.id;
        done();
      });
  });

  it('will destroy the user', (done) => {
    request(app)
      .delete(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

