const debug = require('debug');
const request = require('supertest');
const assert = require('assert');
const app = require('./../../app');
const { Auth } = require('./../../conn/sqldb');
const auth = require('../../../logs/credentials');
const opsAuth = require('../../../logs/ops-credentials');

const log = debug('s.api.user.spec');

// describe(' POST /api/users', () => {
//   it('will create user', (done) => {
//     request(app)
//       .post('/api/users')
//       .send({
//         name: 'Saneel E S',
//         email: 'saneel@shoppre.com',
//         password: 'Password123',
//         group_id: 1,
//       })
//       .set('Authorization', `Bearer ${auth.access_token}`)
//       .expect('Content-Type', /json/)
//       .expect(200)
//       .then(() => {
//         done();
//       });
//   });
// });


describe('GET /api/users/:id', () => {
  log('get');
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
    Auth
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
});
// describe(' POST /api/users/verify', () => {
//   it('verify user ', (done) => {
//     request(app)
//       .post('/api/users/verify')
//       .send({
//         customer_id: '646',
//         email: 'tech.shoppre@gmail.com',
//         email_verify: 'yes',
//       })
//       .set('Authorization', `Bearer ${auth.access_token}`)
//       .expect('Content-Type', /json/)
//       .expect(200)
//       .then(() => {
//         done();
//       });
//   });
// });
//
// describe('member POST /api/users/register', () => {
//   it('will create user', (done) => {
//     request(app)
//       .post('/api/users/register')
//       .send({
//         salutation: 'Mr',
//         last_name: 'v',
//         first_name: 'Manjesh',
//         email: 'manjeshpv+2@gmail.com',
//         phone: '+919844717202',
//         password: 'admin1234',
//         virtual_address_code: 'SHPR78-221',
//         hooks: true,
//       })
//       .set('Authorization', `Bearer ${auth.access_token}`)
//       .expect('Content-Type', /json/)
//       .expect(200)
//       .then(() => {
//         done();
//       });
//   });
// });

//
// describe(' POST /api/users/register', () => {
//   it('will create user with out reffral code', (done) => {
//     request(app)
//       .post('/api/users/register')
//       .send({
//         _token: '2yVT9voBawG19WrPu9aD8QtCDyoysCoqVUxBSJui',
//         referrer: '',
//         title: 'Mr',
//         firstname: 'punith',
//         lastname: 'HS',
//         email: 'punith@shoppre.com',
//         password: 'Punith897097',
//         password_confirmation: 'Punith897097',
//         refferal: '',
//       })
//       .set('Authorization', `Bearer ${auth.access_token}`)
//       .expect('Content-Type', /json/)
//       .expect(200)
//       .then(() => {
//         done();
//       });
//   });
// });

describe(' put /api/users/646/changePassword', () => {
  it('will create user with out reffral code', (done) => {
    request(app)
      .put('/api/users/646/changePassword')
      .send({
        old_password: 'admin1234',
        password: 'admin1234',
        confirm_password: 'admin1234',
      })
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

