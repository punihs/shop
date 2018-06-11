const debug = require('debug');
const request = require('supertest');
const assert = require('assert');
const app = require('./../../app');
const { User } = require('./../../conn/sqldb');
const auth = require('../../../logs/credentials');
const opsAuth = require('../../../logs/ops-credentials');

const log = debug('s.api.user.spec');

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

describe('GET /api/users/states', () => {
  it('return users', (done) => {
    request(app)
      .get('/api/users/states')
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        log('res.body', res.body[1]);
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
        assert.strictEqual(res.body.id, 646);
        assert.strictEqual(res.body.salutation, 'Mr');
        assert.strictEqual(res.body.first_name, 'Abhinav');
        assert.strictEqual(res.body.last_name, 'Mishra');
        assert.strictEqual(res.body.email, 'tech.shoppre@gmail.com');
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
      .create({ email: 'test@test.com' })
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

  it('will give upload url', (done) => {
    request(app)
      .delete('/api/users/presignedUrl')
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

