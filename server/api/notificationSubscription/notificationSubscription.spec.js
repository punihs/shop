const request = require('supertest');
const app = require('./../../app');
const auth = require('../../../logs/credentials');

describe('Notification Subscriptions', () => {
  it('adds', (done) => {
    request(app)
      .post('/api/notificationSubscriptions')
      .send({
        player_id: 'c48b4f9e-ab3d-4d9e-a155-05dccde06066', // manjesh mobile
      })
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(201)
      .then(() => {
        done();
      });
  });

  it('removes', (done) => {
    request(app)
      .del('/api/notificationSubscriptions/c48b4f9e-ab3d-4d9e-a155-05dccde06066')
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect(200)
      .then(() => {
        done();
      });
  });
});
