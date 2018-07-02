const request = require('supertest');
const app = require('../../../app');
const { Package, PackageComment } = require('../../../conn/sqldb');
const auth = require('../../../../logs/credentials');
const opsAuth = require('../../../../logs/ops-credentials');

describe('ops GET /api/packages/1/comments', () => {
  it('return packages/1/comments', (done) => {
    request(app)
      .get('/api/packages/1/comments')
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('member GET /api/packages/1/comments', () => {
  it('return packages/1/comments', (done) => {
    request(app)
      .get('/api/packages/1/comments')
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('ops POST /api/packages/1/comments', () => {
  let pkg;
  before((done) => {
    Package.create({}).then((pack) => {
      pkg = pack;
      done();
    });
  });

  it('save packages/:id/comments', (done) => {
    request(app)
      .post(`/api/packages/${pkg.id}/comments`)
      .send({
        comments: 'Ping',
      })
      .set('Authorization', `Bearer ${opsAuth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(201)
      .then(() => {
        done();
      });
  });

  after((done) => {
    PackageComment
      .destroy({ where: { package_id: pkg.id }, force: true })
      .then(() => pkg.destroy({ force: true }))
      .then(() => done());
  });
});


describe('member POST /api/packages/1/comments', () => {
  let pkg;
  before((done) => {
    Package.create({}).then((pack) => {
      pkg = pack;
      done();
    });
  });

  it('save packages/:id/comments', (done) => {
    request(app)
      .post(`/api/packages/${pkg.id}/comments`)
      .send({
        comments: 'Pong',
      })
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(201)
      .then(() => {
        done();
      });
  });

  after((done) => {
    PackageComment
      .destroy({ where: { package_id: pkg.id }, force: true })
      .then(() => pkg.destroy({ force: true }))
      .then(() => done());
  });
});

