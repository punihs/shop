const request = require('supertest');
const app = require('../../../app');
const { Shipment, Comment } = require('../../../conn/sqldb');
const auth = require('../../../../logs/credentials');
const opsAuth = require('../../../../logs/ops-credentials');

describe('ops GET /api/shipments/1/comments', () => {
  it('return shipments/1/comments', (done) => {
    request(app)
      .get('/api/shipments/1/comments')
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('member GET /api/shipments/1/comments', () => {
  it('return shipments/1/comments', (done) => {
    request(app)
      .get('/api/shipments/1/comments')
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('ops POST /api/shipments/1/comments', () => {
  let pkg;
  before((done) => {
    Shipment.create({}).then((pack) => {
      pkg = pack;
      done();
    });
  });

  it('save shipments/:id/comments', (done) => {
    request(app)
      .post(`/api/shipments/${pkg.id}/comments`)
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
    Comment
      .destroy({ where: { object_id: pkg.id }, force: true })
      .then(() => pkg.destroy({ force: true }))
      .then(() => done());
  });
});


describe('member POST /api/shipments/1/comments', () => {
  let pkg;
  before((done) => {
    Shipment.create({}).then((pack) => {
      pkg = pack;
      done();
    });
  });

  it('save shipments/:id/comments', (done) => {
    request(app)
      .post(`/api/shipments/${pkg.id}/comments`)
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
    Comment
      .destroy({ where: { object_id: pkg.id }, force: true })
      .then(() => pkg.destroy({ force: true }))
      .then(() => done());
  });
});

