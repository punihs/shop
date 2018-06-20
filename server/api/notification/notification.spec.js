const request = require('supertest');
const app = require('../../app');
const auth = require('../../../logs/credentials');

describe('GET /api/notifications', () => {
  it('return notifications', (done) => {
    request(app)
      .get('/api/notifications')
      .query({
        action_type: 'customer',
      })
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('GET /api/notifications', () => {
  it('return notifications', (done) => {
    request(app)
      .get('/api/notifications')
      .query({
        action_type: 'incoming',
      })
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('GET /api/notifications', () => {
  it('return notifications', (done) => {
    request(app)
      .get('/api/notifications')
      .query({
        action_type: 'package',
      })
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('GET /api/notifications', () => {
  it('return notifications', (done) => {
    request(app)
      .get('/api/notifications')
      .query({
        action_type: 'shipment',
      })
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('GET /api/notifications', () => {
  it('return notifications', (done) => {
    request(app)
      .get('/api/notifications')
      .query({
        action_type: 'shopper',
      })
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});
describe('GET /api/notifications', () => {
  it('return notifications', (done) => {
    request(app)
      .get('/api/notifications')
      .query({
        action_type: 'selfshopper',
      })
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});
describe('GET /api/notifications', () => {
  it('return notifications', (done) => {
    request(app)
      .get('/api/notifications')
      .query({
        action_type: 'statuschange',
      })
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});
