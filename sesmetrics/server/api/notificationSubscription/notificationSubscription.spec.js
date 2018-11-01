const request = require('supertest');
const app = require('./../../app');

describe('Notification Subscriptions', () => {
  it('adds', (done) => {
    request(app)
      .post('/api/notificationSubscriptions?user_id=1')
      .send({
        player_id: 'c48b4f9e-ab3d-4d9e-a155-05dccde06066', // manjesh mobile
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });

  it('removes', (done) => {
    request(app)
      .del('/api/notificationSubscriptions/c48b4f9e-ab3d-4d9e-a155-05dccde06066?user_id=1')
      .expect(200)
      .then(() => {
        done();
      });
  });
});
